<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

function find_ca_bundle_path(): ?string {
  $candidates = [];

  $iniCurl = ini_get('curl.cainfo');
  if (is_string($iniCurl) && $iniCurl !== '') $candidates[] = $iniCurl;

  $iniOpenSsl = ini_get('openssl.cafile');
  if (is_string($iniOpenSsl) && $iniOpenSsl !== '') $candidates[] = $iniOpenSsl;

  // Common WAMP locations. (Your machine already has phpMyAdmin's CA bundle here.)
  $candidates[] = 'C:\\wamp64\\apps\\phpmyadmin5.2.1\\vendor\\composer\\ca-bundle\\res\\cacert.pem';

  // If user drops a bundle in the project root, prefer that too.
  $candidates[] = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'cacert.pem';
  $candidates[] = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'certs' . DIRECTORY_SEPARATOR . 'cacert.pem';

  foreach ($candidates as $p) {
    if (!is_string($p) || $p === '') continue;
    $p = trim($p, " \t\n\r\0\x0B\"'");
    if ($p !== '' && is_file($p)) return $p;
  }
  return null;
}

function read_env_key(string $name): ?string {
  // Prefer real environment variable if configured in Apache.
  $val = getenv($name);
  if (is_string($val) && trim($val) !== '') return trim($val);

  // Fallback: read from project root .env (one level above /api).
  $envPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
  if (!is_file($envPath)) return null;

  $lines = @file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  if ($lines === false) return null;

  foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || str_starts_with($line, '#')) continue;
    $parts = explode('=', $line, 2);
    if (count($parts) !== 2) continue;
    $k = trim($parts[0]);
    $v = trim($parts[1]);
    if ($k === $name && $v !== '') return $v;
  }
  return null;
}

function build_system_prompt(string $openingTimes, string $location, string $menuText): string {
  $openingTimes = trim($openingTimes);
  $location = trim($location);
  $menuText = trim($menuText);

  if ($openingTimes === '') $openingTimes = 'Opening times: (not provided)';
  if ($location === '') $location = 'Location: (not provided)';
  if ($menuText === '') $menuText = 'Menu: (not provided)';

  return <<<PROMPT
You are the assistant for a cafe & restaurant.

IMPORTANT RULES (must follow):
- You must ONLY answer questions about:
  1) Menu items (food/drinks): names, descriptions, and prices.
  2) Opening hours / opening times.
  3) Location, address, or how to find the restaurant.
- If the user asks about anything else (reservations, delivery, jobs, complaints, stories, jokes, general knowledge, etc.), you must politely refuse and say you can only help with menu, opening times, and location.
- Be kind, respectful, and concise.
- Respond in the SAME language as the user (Arabic ↔ Arabic, English ↔ English).
- Use ONLY the information provided below. Do not invent items, prices, hours, or address details.

INFORMATION YOU MAY USE:
$openingTimes
$location
$menuText
PROMPT;
}

$key = read_env_key('OPENAI_API_KEY');
if (!$key) {
  http_response_code(500);
  echo json_encode(['error' => 'OPENAI_API_KEY not configured']);
  exit;
}

$raw = file_get_contents('php://input');
if (!is_string($raw) || trim($raw) === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Empty body']);
  exit;
}

$body = json_decode($raw, true);
if (!is_array($body)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON']);
  exit;
}

$messages = $body['messages'] ?? null;
if (!is_array($messages)) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing messages']);
  exit;
}

// Optional context from frontend (we still enforce policy server-side).
$openingTimes = is_string($body['openingTimes'] ?? null) ? (string) $body['openingTimes'] : '';
$location = is_string($body['location'] ?? null) ? (string) $body['location'] : '';
$menuText = is_string($body['menuText'] ?? null) ? (string) $body['menuText'] : '';
$systemPrompt = build_system_prompt($openingTimes, $location, $menuText);

$payload = [
  'model' => 'gpt-4o-mini',
  'messages' => array_merge([['role' => 'system', 'content' => $systemPrompt]], $messages),
  'max_tokens' => 400,
  'temperature' => 0.3,
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
$caBundle = find_ca_bundle_path();
curl_setopt_array($ch, array_filter([
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $key,
  ],
  CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 25,
  // Fix for Windows/WAMP: ensure cURL can verify OpenAI's SSL cert chain.
  CURLOPT_CAINFO => $caBundle ?: null,
]));

$resp = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($resp === false) {
  http_response_code(500);
  $hint = '';
  if ($err && str_contains($err, 'SSL certificate')) {
    $hint = ' (SSL CA bundle missing. Set curl.cainfo in php.ini or place cacert.pem in project root.)';
  }
  echo json_encode(['error' => ($err ?: 'Request failed') . $hint]);
  exit;
}

$data = json_decode($resp, true);
if (!is_array($data)) {
  http_response_code(500);
  echo json_encode(['error' => 'Bad response from OpenAI']);
  exit;
}

if ($httpCode < 200 || $httpCode >= 300) {
  $msg = $data['error']['message'] ?? ('OpenAI API error ' . $httpCode);
  http_response_code($httpCode);
  echo json_encode(['error' => $msg]);
  exit;
}

$content = $data['choices'][0]['message']['content'] ?? '';
echo json_encode(['reply' => is_string($content) ? trim($content) : '']);

