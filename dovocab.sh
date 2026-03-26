#!/bin/bash

perl -i.bak -pe 's|</quiz>\s*||' vocabula.xml && perl -C -ne 'if (m/\s*(.*?)\s*(\x{27A1}\x{FE0F}?|-->|--->)\s*(.*?)\s*$/) {print "<q flash=\"yes\"><content>$1</content><explanation>$3</explanation></q>\n"} END {print "</quiz>"}' vocabula >> vocabula.xml
