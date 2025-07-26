import * as forge from 'node-forge';

export const generateDevSigningParams = async () => {
  // 1. Generate RSA private key
  const keys = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);

  // 2. Create a self-signed certificate
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01'; // Unique serial number
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // Valid for 1 year

  const attrs = [{
    name: 'commonName',
    value: 'Development Signer'
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    shortName: 'ST',
    value: 'California'
  }, {
    name: 'localityName',
    value: 'San Francisco'
  }, {
    name: 'organizationName',
    value: 'Dev Inc.'
  }, {
    shortName: 'OU',
    value: 'Development'
  }];

  cert.setSubject(attrs);
  cert.setIssuer(attrs); // Self-signed, so issuer is the same as subject
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true
  }, {
    name: 'nsCertType',
    sslClient: true,
    sslServer: true,
    email: true,
    objsign: true,
    sslCA: true,
    emailCA: true,
    objCA: true
  }]);

  // Sign the certificate with the private key
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const certificatePem = forge.pki.certificateToPem(cert);

  const signingParams = {
    signerName: "Danish Samir", // You can customize this
    certificatePem: certificatePem,
    privateKeyPem: privateKeyPem
  };
  return signingParams;
};