SRC = $(wildcard lib/*.js)

build: components index.js $(SRC) livechart.css
	@component build --dev
	@touch build

start:
	@component serve &

components: component.json
	@component install --dev

doc:
	@component build --dev -c
	@rm -fr .gh-pages
	@mkdir .gh-pages
	@cp -r resources build .gh-pages/
	@cp example.html .gh-pages/index.html
	@ghp-import .gh-pages -n -p
	@rm -fr .gh-pages

standalone:
	@component build --standalone livechart -o .
	@mv build.js livechart.js

clean:
	rm -fr build components template.js

.PHONY: clean start standalone
