import localtunnel from 'localtunnel';

// Keep the event loop alive indefinitely
setInterval(() => {}, 60000);

const desiredSubdomain = 'jim-fitness-tracker';

async function startTunnel() {
  console.log('[JIM TUNNEL] Initiating tunnel connection for port 5173...');
  let tunnel;
  try {
    tunnel = await localtunnel({
      port: 5173,
      local_host: '127.0.0.1',
      subdomain: desiredSubdomain,
    });

    console.log('==============================================');
    console.log(`[JIM TUNNEL] ACTIVE: ${tunnel.url}`);
    console.log(`[JIM TUNNEL] Localhost proxy: http://localhost:5173`);
    console.log('==============================================');

    tunnel.on('close', () => {
      console.log('[JIM TUNNEL] Tunnel closed by remote host. Reconnecting in 3s...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('[JIM TUNNEL] Socket error:', err?.message || err);
      try { tunnel.close(); } catch {}
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.error('[JIM TUNNEL] Connection attempt failed:', err?.message || err);
    setTimeout(startTunnel, 5000);
  }
}

process.on('uncaughtException', (err) => {
  console.error('[JIM TUNNEL] Uncaught Exception:', err.message);
  setTimeout(startTunnel, 3000);
});

process.on('unhandledRejection', (err) => {
  console.error('[JIM TUNNEL] Unhandled Rejection:', err);
  setTimeout(startTunnel, 3000);
});

startTunnel();
