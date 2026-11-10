# AEGIS relay

Railway serves the authenticated Spectra interface and a scoped WebSocket relay. The Mac maintains an outbound WSS connection; Vite host services listen only on loopback. Hardware is not automatically armed, and the relay does not queue commands when disconnected. A live bridge does not establish device or camera health.

The financial laboratory state is on the Mac at `AEGIS_LAB_DATA_DIR`, outside the repository. The gateway verifies the Alpadev ADMIN session for browser requests and uses a separate bridge credential; never place credentials or laboratory data in a bundle or git. GET and PUT access are explicitly allowlisted. The local store uses an atomic rename and a revision conflict check. A `.writer-lock` left after a crash blocks writes. To recover, first stop the local bridge and verify that no other writer is running; back up the data directory, remove the lock directory only after those checks, then restart the bridge. Export independent backups regularly.

The local agent requires `AEGIS_BRIDGE_URL` (WSS), `AEGIS_BRIDGE_TOKEN`, and `AEGIS_LAB_DATA_DIR`; `AEGIS_LOCAL_ORIGIN` defaults to `http://127.0.0.1:5174`. Set secrets through protected configuration, not command line arguments. Run `node --test` for relay policy and simulated disconnect checks. These tests do not move hardware or prove physical connectivity.
