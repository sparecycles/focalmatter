#!/usr/bin/env python

import os, sys;

with open('node_modules/requirejs/require.js', 'r') as file:
	sys.stdout.writelines(file.readlines())

with open('script/compile-header.js', 'r') as file:
	sys.stdout.writelines(file.readlines())

for root,dirs,files in os.walk('build'):
	if '.git' in dirs:
		dirs.remove('.git')
	for file in [file for file in files if file.endswith('.js')]:
		sys.stderr.write("adding " + os.path.join(root, file) + "\n")
		filename = os.path.join(root, file);
		with open(filename, 'r') as fp:
			sys.stdout.writelines(["  " + s for s in fp.readlines()])

with open('script/compile-footer.js', 'r') as file:
	sys.stdout.writelines(file.readlines())
