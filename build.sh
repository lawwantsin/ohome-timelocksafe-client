#!/bin/sh
# Run me to build the site from src/ to dist/.
# Warning!! Will overwrite contents of dist/ without confirmation.
# Such a good idea here. https://pempek.net/articles/2013/07/08/bash-sh-as-template-engine/
render_template() {
  eval "echo \"$(cat $1)\""
}
# Let's do this!
cd src
# Join support files into one bundled file.
cat *.css > ../dist/bundle.css
cp *.js > ../dist/bundle.js
# Index.html out of all the src html files, injected into template.html.
html=$( find . -maxdepth 1 -iname '*.html' -not -name 'template.html' -exec cat {} + )
render_template template.html > ../dist/index.html
# Back out
cd ..
# Build system. Shipped.
