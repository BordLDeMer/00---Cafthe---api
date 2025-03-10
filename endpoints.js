const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sign } = require("jsonwebtoken");
require("dotenv").config(); // Charger les variables d’environnement
const db = require("./db");
const { verifyToken } = require("./middleware");
const router = express.Router();
/* npm install jsonwebtoken*/

//----------------------------------------------------------------------------------------------------------------------
/**
 * ➤ ROUTE : Inscription d'un nouveau client
 * ➤ URL : POST /api/clients/register
 * ➤ Body attendu (JSON) :
 * {
 *   "nom": "Dupont",
 *   "prenom": "Jean",
 *   "email": "jean.dupont@email.com",
 *   "mot_de_passe": "monMotDePasse"
 * }
 */
router.post("/clients/register", (req, res) => {
  const {nom_prenom, tel, mail, mdp } = req.body;

  // Vérifier si l'email existe déjà
  db.query("SELECT * FROM clients WHERE mail = ?", [mail], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    if (result.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Hachage du mot de passe avant insertion
    bcrypt.hash(mdp, 10, (err, hash) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Erreur lors du hachage du mot de passe" });

      // Insérer le nouveau client
      db.query(
        "INSERT INTO clients (ID_client, nom_prenom, tel, mail, mdp) VALUES (?, ?, ?, ?, ?)",
        [ID-client, nom_prenom, tel, mail, hash],
        (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Erreur lors de l'inscription" });

          res.status(201).json({
            message: "Inscription réussie",
            ID_client: result.insertId,
          });
        },
      );
    });
  });
});


//----------------------------------------------------------------------------------------------------------------------
/**
 * ➤ ROUTE : Connexion d'un client (Génération de JWT)
 * {
 *     "email": "jean.dupont@email.com",
 *     "mot_de_passe": "hashpassword1"
 * }
 */
router.post("/clients/login", (req, res) => {
  const { mail, mdp } = req.body;

  db.query("SELECT * FROM client WHERE mail = ?", [mail], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (result.length === 0) {
      return res.status(401).json({ message: "Identifiant incorrect" });
    }

    const client = result[0];

    /* Vérification du mot de passe */
    bcrypt.compare(mdp, client.mdp, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      if (!isMatch)
        return res.status(401).json({ message: "Mot de passe incorrect" });

      // Géneration d'un token JWT
      const token = sign(
        { id: client.ID_client, mail: client.mail },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      );

      res.json({
        message: "Connexion réussie",
        token,
        client: {
          id: client.ID_client,
          nom_prenom: client.nom_prenom,
          tel: client.tel,
          mail: client.mail,
        },
      });
    });
  });
});


//----------------------------------------------------------------------------------------------------------------------
/**
 * ➤ ROUTE : Récupérer tous les produits
 */
router.get("/produit", (req, res) => {
  db.query("SELECT * FROM produit", (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json(result);
  });
});


//recuprer les produit par leur rayon

router.get("/produit/rayon/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM `produit` WHERE ID_rayon = ?;", [id],(err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json(result);
  });
});
//----------------------------------------------------------------------------------------------------------------------
/**
 * ➤ ROUTE : Récupérer un produit par son ID
 * ➤ URL : GET /api/produits/:id
 * ➤ Exemple d'utilisation : GET /api/produits/1
 */
router.get("/produit/:ID_produit", (req, res) => {
  const { ID_produit } = req.params;

  db.query("SELECT * FROM produit WHERE ID_produit = ?", [ID_produit], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur" });
    }

    //if (result.length === 0) {
    //  return res.status(404).json({ message: "Produit non trouvé" });
    //}

    res.json(result[0]); // Retourner le premier (et unique) résultat
  });
});

//----------------------------------------------------------------------------------------------------------------------
/**
 * ➤ ROUTE : Passer une commande (nécessite un JSON avec client_id et un tableau produits)
 */

//----------------------------------------------------------------------------------------------------------------------
/**
 * ➤ ROUTE PROTÉGÉE : Récupérer les commandes d'un client connecté
 */

//----------------------------------------------------------------------------------------------------------------------
/**
 * Route pour afficher que les cafés sur la page café
 */


// Route pour récupérer les produits contenant "café" dans la désignation
router.get('/products', (req, res) => {
  const filter = req.query.filter || '';

  // Requête SQL pour récupérer les produits dont la désignation contient le mot "café"
  const query = 'SELECT * FROM produit WHERE designation_produit LIKE ?';

  db.query(query, [`%${filter}%`], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des produits:', err);
      return res.status(500).send({ message: 'Erreur lors de la récupération des produits' });
    }
    res.json(results);
  });
});

//----------------------------------------------------------------------------------------------------------------------

/**
 * Route pour sélectionner les produits en solde
 */

// Route pour récupérer les produits avec un solde = 1
router.get('/products/solde', (req, res) => {
  // Requête SQL pour récupérer les produits où la colonne solde = 1
  const query = 'SELECT * FROM produit WHERE solde = 1';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des produits avec solde 1:', err);
      return res.status(500).send({ message: 'Erreur lors de la récupération des produits avec solde 1' });
    }
    res.json(results);
  });
});

module.exports = router;

