from __future__ import annotations

import pytest
from fastapi import HTTPException

from app.dependencies import _authorize


def test_non_ascii_api_key_is_an_authentication_failure() -> None:
    with pytest.raises(HTTPException) as error:
        _authorize("clé-non-ascii", "expected-ascii-key", "X-Test-Key")

    assert error.value.status_code == 401
