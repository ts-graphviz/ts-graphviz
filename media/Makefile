DOT = $(wildcard ./*.dot)
SVG = $(DOT:./%.dot=./%.svg)

gen: image $(SVG)
	cp adapter-state-machine.svg ../packages/adapter/media/adapter-state-machine.svg
	cp adapter-state-machine.svg ../packages/ts-graphviz/media/adapter-state-machine.svg
	cp state-machine.svg ../packages/ts-graphviz/media/state-machine.svg
	cp ts-graphviz.svg ../packages/ts-graphviz/media/ts-graphviz.svg

image: $(SVG)

%.svg: %.dot
	dot -Tsvg $< | pnpm --silent exec svgo - > $@
