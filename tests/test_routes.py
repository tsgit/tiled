import pytest
from httpx import ASGITransport, AsyncClient
from starlette.status import HTTP_200_OK

from tiled.server.app import build_app


@pytest.mark.parametrize("path", ["/", "/docs", "/healthz"])
@pytest.mark.asyncio
async def test_meta_routes(path):
    transport = ASGITransport(app=build_app({}))
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(path)
    assert response.status_code == HTTP_200_OK


@pytest.mark.asyncio
async def test_about_root_path_default():
    """With no proxy prefix, meta.root_path is just '/api'."""
    transport = ASGITransport(app=build_app({}))
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/")
    assert response.status_code == HTTP_200_OK
    assert response.json()["meta"]["root_path"] == "/api"


@pytest.mark.asyncio
async def test_about_root_path_with_prefix():
    """When served behind a proxy prefix (uvicorn.root_path), the about
    endpoint's meta.root_path must include that prefix so the UI can build
    correct API URLs. Regression test for the operator-precedence bug in
    router.py and the hardcoded FastAPI(root_path=...) in app.py."""
    app = build_app({}, server_settings={"root_path": "/tiled-dev"})
    transport = ASGITransport(app=app, root_path="/tiled-dev")
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/")
    assert response.status_code == HTTP_200_OK
    assert response.json()["meta"]["root_path"] == "/tiled-dev/api"
