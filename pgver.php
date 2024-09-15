<?php

// This fetches https://client.projectgorgon.com/fileversion.txt
// (a single number), but does it at most once per hour

function clear_opcache($path) {
    if (function_exists('opcache_invalidate') &&
            strlen(ini_get("opcache.restrict_api")) < 1) {
        opcache_invalidate($path, true);
    } elseif (function_exists('apc_compile_file')) {
        apc_compile_file($path);
    }
}

$time_since_update = time() - filemtime('pgver_raw.php');
if ($time_since_update >= 3600) {
    $response = file_get_contents("https://client.projectgorgon.com/fileversion.txt");
    if ($response !== FALSE) {
        file_put_contents('pgver_raw.php', '<?php /* AUTOGENERATED */ $PGVER = "' . $response . '"; ?>');
        clear_opcache('pgver_raw.php');
    }
}

require 'pgver_raw.php';
echo $PGVER;
?>
