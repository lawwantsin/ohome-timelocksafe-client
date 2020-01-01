# #!/bin/bash
echo "Watching ./src and running build on file change..."
echo "Ctrl+C to Quit"
echo
fswatch -o ./src | xargs -n1 -I{} ./build.sh
