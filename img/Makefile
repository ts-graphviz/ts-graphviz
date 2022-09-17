DOT = $(wildcard ./*.dot)
SVG = $(DOT:./%.dot=./%.svg)

image: $(SVG)

%.svg: %.dot
	dot -Tsvg $< | yarn --silent run svgo - > $@
