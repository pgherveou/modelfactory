build:
	@component build --dev --verbose

components:
	@component install --dev

clean:
	rm -fr build components template.js

test:
	make build
	open -a Google\ Chrome http://localhost:4000/test

.PHONY: clean build test
