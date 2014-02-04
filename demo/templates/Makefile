# This will compile all .html files in a directory into ONE .js file
# the filename of the html file will be used as the DUST template name
# i.e. my_template.html will compile and can be called via dust.render('my_template', tmpldata, callback)


# relative path (from Makefile) to output directory (where the resulting js file will be saved)
TEMPLATE_OUT_SRC = ../
# relative path (from Makefile) to source directory (where the non-compiled templates are)
# leave as is if you keep the makefile in the same dir as your templates
TEMPLATE_IN_SRC = ./

HTML = $(shell find $(TEMPLATE_IN_SRC) | grep '.*\.html')
TMPL_NAME = $(subst //,/,$(HTML))
DUST = $(subst $(TEMPLATE_IN_SRC),$(TEMPLATE_OUT_SRC),$(TMPL_NAME:.html=.js))
CAT = ../results.tmpl.js


all: $(DUST)

$(TEMPLATE_OUT_SRC)%.js: $(TEMPLATE_IN_SRC)%.html
	dustc -n=$* $< >> $(CAT)

clean:
	rm -f $(DUST)
	rm -f $(CAT)

.PHONY: clean