#!/usr/bin/env python

import os, sys;

with open('script/compile-header.js', 'r') as file:
	sys.stdout.writelines(file.readlines())

def prefix(file):
	return ("""
          require.define("%s", function(module, exports, require) {
	""" % file).strip() + "\n"

def suffix(file):
	return ("""}); // %s""" % file).strip() + "\n\n"

for root,dirs,files in os.walk('lib'):
	if '.git' in dirs:
		dirs.remove('.git')
	for file in [file for file in files if file.endswith('.js')]:
		sys.stderr.write("adding " + os.path.join(root, file) + "\n")
		filename = os.path.join(root, file);
		with open(filename, 'r') as fp:
			sys.stdout.write(prefix(filename))
			sys.stdout.writelines(["  " + s for s in fp.readlines()])
			sys.stdout.write(suffix(filename))

with open('script/compile-footer.js', 'r') as file:
	sys.stdout.writelines(file.readlines())
