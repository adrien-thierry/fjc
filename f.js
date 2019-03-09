/*
 * This file is part of FJC
 * Copyright (c) 2019 Adrien THIERRY
 * https://github.com/adrien-thierry/fjc
 *
 * sources : https://github.com/adrien-thierry/fjc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
 
var path = require("path");
var fs  = require("fs");
var child_process = require("child_process");
var fork = child_process.fork;
var os = require("os");
var crypto = require("crypto");

var CURRENT_DIR = process.cwd();

var parseCLI = require("./base/cliParser.js");

var Git;

try 
{
	Git = require("nodegit");
}
catch(e)
{
	ERROR("[!] Please install required packages with : npm update");
}
var FJC_FILE = "fjc";
var GIT_START = "https://github.com/";
var FJC_REPO = GIT_START + "adrien-thierry/fortressjs/";
var FJC_DEFAULT_ENGINES = GIT_START + "adrien-thierry/fortressjs-engines/";

CLI = parseCLI(process.argv);

function ERROR(_msg)
{
	console.error(_msg);
	process.exit();
}

if(CLI.error)
{
	EROR(CLI.msg);
}

if(CLI.cli["--help"] || CLI.cli["-h"])
{
	HELP();
}
else if(CLI.cli["--start"])
{
	fork(path.join(CURRENT_DIR, "wf.js"));
}
else if(CLI.cli["--create"])
{
	console.log("[+] CREATING NEW FJC INSTANCE : " + CLI.cli["--create"].argument);
	Git.Clone(FJC_REPO, path.join(CURRENT_DIR, CLI.cli["--create"].argument))
	.then(function(){fs.writeFileSyncpath.join(CURRENT_DIR, CLI.cli["--create"].argument, FJC_FILE)})
	.then(function(){console.log("[*] Done")});
}
else if(CLI.cli["--add"])
{
	var _inFJC = fs.existsSync(FJC_FILE);
	if(!_inFJC) ERROR("[!] Not in a FJC folder, please create a new FJC instance with : fjc --create {NAME} && cd {NAME}");
	switch(CLI.cli["--add"].argument)
	{
		case "srv":
			if(CLI.cli["--name"])
			{
				var _full = CLI.cli["--name"].argument;
				var _name = _full.split("/");
				
				if(_name.length != 2)
				{
					ERROR("[!] Bad srv name : " + _full);
				}
				
				_name = _name[1];
				var _srv = path.join(CURRENT_DIR, "content", "srv");
				removeEmpty(_srv);
				
				Git.Clone(GIT_START + CLI.cli["--name"].argument, path.join(_srv, _name))
				.catch(function(err) { console.log(err); } );
			}
			else if(CLI.cli["--url"])
			{
				var _full = CLI.cli["--url"].argument;
				var _name = _full.split("/");
				
				if(_name.length < 3)
				{
					ERROR("[!] Bad srv url : " + _full);
				}
				
				_name = _name[_name.length - 1];
				var _srv = path.join(CURRENT_DIR, "content", "srv");
				
				removeEmpty(_srv);
				Git.Clone(_full, path.join(_srv, _name))
				.catch(function(err) { console.log(err); } );
			}
			else
			{
				ERROR("[!] please specify --name or --url");
			}
		break;
		case "engine" :
				if(CLI.cli["--default"])
				{
					var _tmp = getTmpDirName();
					var _engine = path.join(CURRENT_DIR, "content", "engine");
					
					removeEmpty(_engine);
					Git.Clone(FJC_DEFAULT_ENGINES, _tmp)
					.then(function()
					{
						var _list = fs.readdirSync(_tmp);
						for(var _l in _list)
						{
							if(fs.lstatSync(path.join(_tmp, _list[_l])).isDirectory() && _list[_l][0] != "." )
							{
								fs.renameSync( path.join(_tmp, _list[_l]), path.join(_engine, _list[_l]));
							}
						};
						deleteFolderRecursive(_tmp);
					})
					.catch(function(err) { console.log(err); } );
					
				}
				else 
				{
					ERROR("[!] please specify --default, --name or --url");
				}
		break;
		default:
			console.error("[+] Invalid --add option");
			break;
	}
}
else 
{
	HELP();
}

function deleteFolderRecursive(_path) 
{
    var files = [];
    if( fs.existsSync(_path) ) 
	{
        files = fs.readdirSync(_path);
        files.forEach(function(file,index)
		{
            var curPath = path.join(_path, file);
            if(fs.lstatSync(curPath).isDirectory()) 
			{ 
                deleteFolderRecursive(curPath);
            } 
			else 
			{ 
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(_path);
    }
};

function getTmpDirName()
{
	return path.join(os.tmpdir(), tmpName());
}

function tmpName(_size)
{
	if(!_size) _size = 10;
	return crypto.randomBytes(_size).toString('hex').substr(_size);
	
}

function removeEmpty(_path)
{
	try 
	{
		fs.unlinkSync(path.join(_path, "empty"));
	}catch(e){};
}

function HELP()
{
	console.log("Usage : fjc [--start|--create|--add|--help]");
	process.exit(0);
}