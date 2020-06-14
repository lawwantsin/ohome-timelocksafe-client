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

echo "⚙️  \033[1;89mRebuilding...⚙️\033[0m"
# Delete old stuff.
rm -r dist/*
# Join JS/CSS files into two bundled files.
cat src/*.css > dist/bundle.css
cat src/*.js > dist/bundle.js
# Copy over the whole images folder
cp -r src/images dist/

# Index.html out of all the src html files, injected into template.html with ${variables}.
# template.html points to bundled js/css files in dist.
# Right now the only variable is html.
# html=$( find . -maxdepth 2 -path '*src*' -iname '*.html' -not -name 'template.html' -exec cat {} + )
html=$(cat src/setup.html)
render_template src/template.html > dist/index.html

html=$(cat src/add.html)
mkdir dist/add
render_template src/template.html > dist/add/index.html

html=$(cat src/logs.html)
mkdir dist/logs
render_template src/template.html > dist/logs/index.html

mkdir dist/list
html=$(cat src/list.html)
render_template src/template.html > dist/list/index.html

mkdir dist/diag
html=$(cat src/diag.html)
render_template src/template.html > dist/diag/index.html

echo "📦 \033[1;92mSuccess! /dist folder rebuilt. 📦\033[0m"
echo
# Build system. Shipped.
