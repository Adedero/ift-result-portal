const fs = require('node:fs/promises');
const { getDownloadURL } = require('firebase-admin/storage');
const bucket = require('../config/firebase-admin.config');
const logger = require('../config/winston.config');

// Upload a single file
async function uploadFile(filePath, options = {}) {
  options = { 
    fileName: "",
    path: "", 
    contentType: "application/pdf",
    timeout: 1000 * 60,
    ...options
  }

  let fileName = options.fileName || filePath.split("/").pop();

  const timeout = options.timeout;
  if (typeof timeout !== 'number') timeout = 0;
  let timer;

  try {
    if (timeout) {
      timer = setTimeout(() => {
        throw new Error("The request took too long to complete.");
      }, timeout);
    }

    const uploadedFile = await bucket.upload(filePath, {
      destination: `${options.path}/${fileName}`,
      metadata: {
        contentType: options.contentType
      }
    });

    const fileRef = bucket.file(uploadedFile[0].metadata.name);
    const downloadURL = await getDownloadURL(fileRef);

    return downloadURL;

  } catch (error) {
    console.error(`Error uploading file ${fileName}: ${error.message}`);
    throw new Error(`Error uploading file ${fileName}: ${error.message}`);
  } finally {
    if (timer) clearTimeout(timer);
    await fs.unlink(filePath)
      .catch(err => {
        console.error(`Error deleting file from disk: ${err.message}`)
        logger.info({
          level: 'error',
          message: `Error deleting file from disk: ${err.message}`,
          timestamp: Date.now()
        })
      }
    );
  }
}


// Delete a single file
async function deleteFiles(fileNameOrURL, options = {}) {
  options = {
    path: "",
    useURL: false,
    timeout: 1000 * 60,
    ...options
  }

  const timeout = options.timeout;
  if (typeof timeout !== 'number') timeout = 0;
  let timer;

  try {
    if (timeout) {
      timer = setTimeout(() => {
        throw new Error("The request took too long to complete.");
      }, timeout);
    }


    if (Array.isArray(fileNameOrURL)) {
      const deletePromises = fileNameOrURL.map(nameOrURL => deleteFile(nameOrURL));
      await Promise.all(deletePromises);
    } else {
      await deleteFile(fileNameOrURL);
    }

    async function deleteFile(nameOrURL) {
      let fileName;
      if (options.useURL) {
        const fileUrl = new URL(nameOrURL);
        fileName = decodeURIComponent(fileUrl.pathname.split('/o/')[1].split('?')[0]);
      } else {
        fileName = nameOrURL;
      }
      console.log(fileName)
      let filePath = `${options.path}/${fileName}`;
      const fileRef = bucket.file(filePath);
      await fileRef.delete();
      console.log(`File ${fileName} deleted successfully.`);
    }

    /* let filePath;
    if (options.useURL) {
      const fileUrl = new URL(fileName);
      filePath = decodeURIComponent(fileUrl.pathname.split('/o/')[1].split('?')[0]);
    } else {
      filePath = `${options.path}/${fileName}`;
    }

    const fileRef = bucket.file(filePath);
    await fileRef.delete();
    console.log(`File ${filePath} deleted successfully.`); */
  } catch (err) {
    console.error(`Error deleting file: ${err.message}`);
    throw new Error(`Error deleting file: ${err.message}`);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

module.exports = { uploadFile, deleteFiles };