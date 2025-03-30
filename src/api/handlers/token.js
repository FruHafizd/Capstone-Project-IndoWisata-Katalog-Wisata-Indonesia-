function generateToken() {
    return Math.floor(1000 + Math.random() * 9000); // Hasil: 1000 - 9999
  }

  const token = generateToken()
  console.log(token)