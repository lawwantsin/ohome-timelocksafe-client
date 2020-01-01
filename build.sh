#!/bin/sh
#######################################################
# Run me to build the site from src/ to dist/.
# Warning!! Will overwrite dist/ without confirmation.
#######################################################

# Such a good idea here from here:
# https://pempek.net/articles/2013/07/08/bash-sh-as-template-engine/
render_template() {
  eval "echo \"$(cat $1)\""
}

# Let's do this!
# Delete old stuff.
rm dist/*
# Join JS/CSS files into two bundled files.
cat src/*.css > dist/bundle.css
cat src/*.js > dist/bundle.js

# Index.html out of all the src html files, injected into template.html with ${variables}.
# template.html points to bundled files above.

html=$( find . -maxdepth 2 -path '*src*' -iname '*.html' -not -name 'template.html' -exec cat {} + )

render_template src/template.html > dist/index.html

echo "Building... Success!  ./dist folder rebuilt!"
echo "Ctrl+C to Quit"
echo "Watching..."
echo
# Build system. Shipped.
