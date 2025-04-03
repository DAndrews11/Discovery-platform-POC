{ pkgs }: {
    deps = [
        pkgs.nodejs-18_x
        pkgs.nodePackages.typescript
        pkgs.nodePackages.npm
        # Basic development tools
        pkgs.which
        pkgs.gnumake
        pkgs.gcc
        # Add python for node-gyp
        pkgs.python3
    ];
    env = {
        PYTHONPATH = "${pkgs.python3}/lib/python3.11/site-packages";
        PYTHON = "${pkgs.python3}/bin/python3";
    };
} 