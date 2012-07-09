focal.js : index.js FORCE
	./compile.py >$@

clean:
	rm focal.js

server: FORCE
	server --execute /focal.js:make

.PHONY: FORCE clean
FORCE : ;
