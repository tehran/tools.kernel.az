function preprocessInput(str) {

  str = str.trim();

  if (str.substring(0, 13) == 'enc_GroupPwd=') {
    str = str.substring(13);
  }

  str = str.trim();

  if (str.substring(0, 1) == "'" || str.substring(0, 1) == '"') {
    str = str.substring(1);
  }

  if (str.substring(str.length - 1, str.length) == "'" ||
      str.substring(str.length - 1, str.length) == '"') {
    str = str.substring(0, str.length - 1);
  }

  str = str.trim();

  if (/^([A-Fa-f0-9]{2})+$/.test(str))
  {
    return str;
  }

  return "";
}

function base16decode(str) {
  return str.replace(/([A-Fa-f0-9]{2})/g, function(m, g1) {
      return String.fromCharCode(parseInt(g1, 16));
  });
}

function get_temp_hash(origHash, offset) {
  return origHash.substring(0, 19) +
    String.fromCharCode(origHash.charCodeAt(19) + offset);
}

function calc_3des_key(origHash) {
  var md = forge.md.sha1.create();
  md.update(get_temp_hash(origHash, 1));
  var hashV1 = md.digest().getBytes();

  md = forge.md.sha1.create();
  md.update(get_temp_hash(origHash, 3));
  var hashV2 = md.digest().getBytes();

  return hashV1 + hashV2.substring(0, 4);
}

function decryptPassword(pwd) {
  pwd = preprocessInput(pwd);
  if (pwd == "") {
    return "";
  }

  var binPwd = base16decode(pwd);
  var desKey = calc_3des_key(binPwd);
  var iv = binPwd.substring(0, 8);
  var encrypted = binPwd.substring(40);
  var encryptedBuffer = forge.util.createBuffer(encrypted, 'raw');

  var decipher = forge.cipher.createDecipher('3DES-CBC', desKey);
  decipher.start({iv: iv});
  decipher.update(encryptedBuffer);
  decipher.finish();
  var decrypted = decipher.output.getBytes();

  return decrypted;
}

