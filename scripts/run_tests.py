#!/usr/bin/env python3
"""Run Align42 test suites in a fixed order.

Core suite: deterministic tests using synthetic data and no network/UI dependencies.
Dependency suite: adapter tests that simulate external integrations with stubs.
"""

import subprocess
import sys


SUITES = [
    ("Core suite (synthetic data)", "tests.test_core"),
    ("Dependency suite (simulated externals)", "tests.test_dependencies"),
    ("Server suite (auth/security/migrations)", "tests.test_server"),
    ("Roadmap/report regression suite", "tests.test_roadmap_logic"),
]


def run_suite(label, module):
    print(f"\n==> {label}")
    proc = subprocess.run(
        [sys.executable, "-m", "unittest", "-v", module],
        check=False,
    )
    return proc.returncode


def main():
    rc = 0
    for label, module in SUITES:
        suite_rc = run_suite(label, module)
        if suite_rc != 0:
            rc = suite_rc
            break

    if rc == 0:
        print("\nAll test suites passed.")
    else:
        print("\nTest execution failed.")
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
