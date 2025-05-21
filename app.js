const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
let filefilter = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
let dirPath = "G:\\Pictures";
let newdirPath = "G:\\PicturesII";
	
function readFilesRecursively(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileStat = fs.statSync(filePath);
	const filename = path.basename(filePath);
    if (fileStat.isDirectory()) {
      readFilesRecursively(filePath, fileList); // Recursive call for subdirectories
    } else {
	  const ext = path.extname(file).toLowerCase();
	  if (filefilter.includes(ext))
	  {
		let info = {};
		info.filepath = filePath;
		info.createddate = fileStat.birthtime;
		info.filename = filename;
		info.ext = ext;
		const fileSizeInBytes = fileStat.size;
		info.size = fileSizeInBytes;
		fileList.push(info);
	  }
    }
  }
  return fileList
}

function createdirectory (newdirPath)
{
	// Check if the directory exists
	if (!fs.existsSync(newdirPath)) {
	  // If it doesn't exist, create the directory
	  fs.mkdirSync(newdirPath);

	  console.log(`Directory '${newdirPath}' created.`);
	} else {
	  console.log(`Directory '${newdirPath}' already exists.`);
	}	
}

async function copyFile(source, destination) {
  try {
    // Ensure the destination directory exists
    await fs.promises.mkdir(path.dirname(destination), { recursive: true });

    // Copy the file
    await fs.promises.copyFile(source, destination);
    console.log(`File copied successfully from ${source} to ${destination}`);
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

foldername = function(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
	const day = String(date.getDate()).padStart(2, '0');
	const shortMonth = date.toLocaleString('default', { month: 'short' });
  return `${year}-${shortMonth}`;
};

// Define a function and assign it to app.locals
app.locals.formatDate = function(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
	const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

let uniqueindex = {};
newfilename = function(date,count,ext) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
	const day = String(date.getDate()).padStart(2, '0');
	if (uniqueindex[year + month + day] == undefined)
	{
		uniqueindex[year + month + day] = 0;
	}
	uniqueindex[year + month + day] += 1;
	count = uniqueindex[year + month + day];
  return `${year}-${month}-${day}-${count}.${ext}`;
};

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define routes
app.get('/', (req, res) => {
	let mypictures = [];
	
	createdirectory(newdirPath);
	readFilesRecursively(dirPath, mypictures);
	mypictures.sort((a, b) => {
		if (a.createddate < b.createddate) return -1;
		if (a.createddate > b.createddate) return 1;
		return 0;
	});

	for (let i=0; i < mypictures.length; i++)
	{
	  let mypicture = mypictures[i];
	  mypictures[i].foldername = newdirPath + "\\" + foldername(mypicture.createddate);
	  let mynewfilename = newfilename(mypicture.createddate,i,mypicture.ext.replace(".",""));
	  let newpath = mypictures[i].foldername + "\\" + mynewfilename;
	  mypictures[i].newpath = newpath;
	  createdirectory(mypictures[i].foldername);
	  let destination = mypictures[i].newpath;
	  let source = mypictures[i].filepath;
	  //console.log("copying file from " + source + " to " + destination);
	  if (fs.existsSync(destination)) {
		  console.log(destination + ' File already exists!');
		} else {
		  copyFile(source, destination);;
		}
	}
	res.render('index', { message: 'Hello 2, EJS!', count: mypictures.length, images: mypictures });
});

app.get('/about', (req, res) => {
 res.render('about', { pageTitle: 'About Us' });
});

// Example of using a route parameter
app.get('/user/:name', (req, res) => {
	res.render('user', { userName: req.params.name });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});