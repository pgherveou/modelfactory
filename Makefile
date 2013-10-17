build:
	@component build --dev --verbose

components:
	@component install --dev

test:
	@./node_modules/.bin/mocha

clean:
	rm -fr build components template.js

.PHONY: clean build test
