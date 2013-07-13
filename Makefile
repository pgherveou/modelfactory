build:
	@component build --dev --verbose

components:
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean build
