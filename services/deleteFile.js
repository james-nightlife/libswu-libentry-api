import fs from 'fs';

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete orphaned file:', err);
    });
}

export default deleteFile;