.PHONY: *

install:
	npm install

pretty:
	npx prettier --write .

start:
	npm start

css-gal:
	npx tailwindcss -i gallery/input.css -o gallery/output.css --watch

css-gal-ext:
	npx tailwindcss -i gallery-ext/input.css -o gallery-ext/output.css --watch
