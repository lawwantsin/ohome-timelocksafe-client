# #!/bin/bash
clear
./build.sh
echo "🔥 \033[1;92mWatching ./src and running ./build.sh on file change. 🔥\033[0m"
echo "   Ctrl+C to Quit"
echo
fswatch -o ./src | xargs -n1 -I{} ./build.sh
