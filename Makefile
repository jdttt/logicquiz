XML_FILES := $(wildcard *.xml)

JSON_FILES := $(XML_FILES:.xml=.json)

.PHONY: all

all: vocabula quizScript.js $(JSON_FILES) final

vocabula:
	perl -i.bak -pe 's|</quiz>\s*||' vocabula.xml && perl -C -ne 'if (m/\s*(.*?)\s*(\x{27A1}\x{FE0F}?|-->|--->|—>)\s*(.*?)\s*$$/) {print "<q flash=\"yes\"><content>$$1</content><explanation>$$3</explanation></q>\n"} END {print "</quiz>"}' vocabula >> vocabula.xml
quizScript.js: quizScript.ts
	- tsc $< 
%.json: %.xml
	perl -pe 's|quiz.json|$@|' quizScript.js > _.js
	perl -pe 's|(script>)(</script)|my $$scr = do { local $$/; open my $$fh, "<", "_.js" or die $$!; <$$fh> }; $$1 . $$scr . $$2|xe' baseindex.html > index.html
	rm _.js
	xmltojson $< > $@ && scpToWebsite.sh -f quizzes/$(basename $<) $@
	rm $@
	scpToWebsite.sh -f quizzes/$(basename $<) index.html
	rm index.html
final:
	rm quizScript.js
