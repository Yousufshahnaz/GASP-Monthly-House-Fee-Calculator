/**
 * Convert pdf file (blob) to a text file on Drive, using built-in OCR.
 * By default, the text file will be placed in the root folder, with the same
 * name as source pdf (but extension 'txt'). Options:
 *   keepPdf (boolean, default false)     Keep a copy of the original PDF file.
 *   keepGdoc (boolean, default false)    Keep a copy of the OCR Google Doc file.
 *   keepTextfile (boolean, default true) Keep a copy of the text file.
 *   path (string, default blank)         Folder path to store file(s) in.
 *   ocrLanguage (ISO 639-1 code)         Default 'en'.
 *   textResult (boolean, default false)  If true and keepTextfile true, return
 *                                        string of text content. If keepTextfile
 *                                        is false, text content is returned without
 *                                        regard to this option. Otherwise, return
 *                                        id of textfile.
 *
 * @param {blob}   pdfFile    Blob containing pdf file
 * @param {object} options    (Optional) Object specifying handling details
 *
 * @returns {string}          id of text file (default) or text content
 */
function pdfToText ( pdfFile, options ) {
  // Ensure Advanced Drive Service is enabled
  try {
    Drive.Files.list();
  }
  catch (e) {
    throw new Error( "To use pdfToText(), first enable 'Drive API' in Resources > Advanced Google Services." );
  }
  
  // Set default options
  options = options || {};
  options.keepTextfile = options.hasOwnProperty("keepTextfile") ? options.keepTextfile : true;
  
  // Prepare resource object for file creation
  var parents = [];
  if (options.path) {
    parents.push( getDriveFolderFromPath (options.path) );
  }
  var pdfName = pdfFile.getName();
  var resource = {
    title: pdfName,
    mimeType: pdfFile.getContentType(),
    parents: parents
  };
  
  // Save PDF to Drive, if requested
  if (options.keepPdf) {
    var file = Drive.Files.insert(resource, pdfFile);
  }
  
  // Save PDF as GDOC
  resource.title = pdfName.replace(/pdf$/, 'gdoc');
  var insertOpts = {
    ocr: true,
    ocrLanguage: options.ocrLanguage || 'en'
  }
  var gdocFile = Drive.Files.insert(resource, pdfFile, insertOpts);
  
  // Get text from GDOC  
  var gdocDoc = DocumentApp.openById(gdocFile.id);
  var text = gdocDoc.getBody().getText();
  
  // We're done using the Gdoc. Unless requested to keepGdoc, delete it.
  if (!options.keepGdoc) {
    Drive.Files.remove(gdocFile.id);
  }
  
  // Save text file, if requested
  if (options.keepTextfile) {
    resource.title = pdfName.replace(/pdf$/, 'txt');
    resource.mimeType = MimeType.PLAIN_TEXT;

    var textBlob = Utilities.newBlob(text, MimeType.PLAIN_TEXT, resource.title);
    var textFile = Drive.Files.insert(resource, textBlob);
  }
  
  // Return result of conversion
  if (!options.keepTextfile || options.textResult) {
    return text;
  }
  else {
    return textFile.id
  }
}

// Helper utility from http://ramblings.mcpher.com/Home/excelquirks/gooscript/driveapppathfolder
function getDriveFolderFromPath (path) {
  return (path || "/").split("/").reduce ( function(prev,current) {
    if (prev && current) {
      var fldrs = prev.getFoldersByName(current);
      return fldrs.hasNext() ? fldrs.next() : null;
    }
    else { 
      return current ? null : prev; 
    }
  },DriveApp.getRootFolder()); 
}