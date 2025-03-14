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
/**npm
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
  db.query("SELECT * FROM client WHERE mail = ?", [mail], (err, result) => {
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
        "INSERT INTO client (nom_prenom, tel, mail, mdp) VALUES (?, ?, ?, ?)",
        [nom_prenom, tel, mail, hash],
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
  const { email, mot_de_passe } = req.body;
  console.log(res.body)

  db.query("SELECT * FROM client WHERE mail = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (result.length === 0) {
      return res.status(401).json({ message: "Identifiant incorrect" });
    }

    const client = result[0];

    /* Vérification du mot de passe */
    bcrypt.compare(mot_de_passe, client.mdp, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      if (!isMatch)
        return res.status(401).json({ message: "Mot de passe incorrect" });

      // Géneration d'un token JWT
      const token = sign(
        { id: client.ID_client, mail: client.mail },
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
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
  const query = 'SELECT * FROM produit WHERE solde = 1 limit 10';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des produits avec solde 1:', err);
      return res.status(500).send({ message: 'Erreur lors de la récupération des produits avec solde 1' });
    }
    res.json(results);
  });
});

// Route pour récupérer un produit aléatoire par rayon
router.get('/random-product-by-rayon', (req, res) => {
  const query = `SELECT p.ID_produit, p.ID_rayon
                 FROM produit p
                        INNER JOIN (
                   SELECT ID_rayon, MIN(ID_produit) AS ID_produit
                   FROM (
                          SELECT ID_rayon, ID_produit,
                                 ROW_NUMBER() OVER(PARTITION BY ID_rayon ORDER BY RAND()) AS rn
                          FROM produit
                        ) AS ranked
                   WHERE rn = 1
                   GROUP BY ID_rayon
                 ) AS selected_produit
                                   ON p.ID_rayon = selected_produit.ID_rayon
                                     AND p.ID_produit = selected_produit.ID_produit
                 ORDER BY p.ID_rayon;`;

  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send({ error: 'Error retrieving random products by rayon' });
      return;
    }
    res.json(result);
  });
});

//----------------------------------------------------------------------------------------------------------------------
// Route pour récupérer la dernière commande d'un utilisateur par son ID
router.get("/commande/client/ouvert/:id", (req, res) => {
  db.query (
      "SELECT * FROM commande AS C WHERE C.ID_client = ? ORDER BY C.ID_commande DESC LIMIT 1",
      [req.params.id],
      (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Erreur lors de la récupération de la commande' });
        }
        if (result.length === 0) {
          return res.status(404).json({message : "Commande non trouvée"})
        }
        res.json(result[0])
      })
})

//----------------------------------------------------------------------------------------------------------------------
// Route pour enregistrer ou ajouter à une ligne de panier
// Infos : ID_commande, ID_produit
router.post("/ligne/ajouter", verifyToken, (req, res) => {
  const {ID_commande, ID_produit} = req.body;

  db.query(`SELECT * FROM ligne_panier WHERE ID_commande = ? AND ID_produit = ?`,
      [ID_commande, ID_produit],
      (error, result) => {
    if (error){
      return res.status(500).json({message: "Erreur lors de la récupération de la ligne de panier"})
    }
    if (result.length === 0){
      db.query(`INSERT INTO ligne_panier (qte_pdt_ligne_panier, ID_commande, ID_produit) VALUES (1, ?, ?)`,
          [ID_commande, ID_produit],
          (error, result) => {
        if (error){
          return res.status(500).json({message: "Erreur lors de la création d'une nouvelle ligne de panier"})
        }
        res.status(201).json({message: "Ajout réussi", ID_ligne_panier: result.insertId})
          })
    } else {
      db.query("UPDATE ligne_panier SET qte_pdt_ligne_panier = qte_pdt_ligne_panier + 1 WHERE ID_commande = ? AND ID_produit = ?",
          [ID_commande, ID_produit],
          (error, result) => {
        if (error){
          return res.status(500).json({message: "Erreur lors de la création d'une nouvelle ligne de panier"})
        }
          })
    }
      })
})

//-----------------------------------------------------------------------------------------------------------------------
// Route pour récupérer toutes les lignes panier d'une commande
// Infos : ID_commande
router.get("/ligne/commande/:ID_commande", (req, res) => {
  const {ID_commande} = req.params

  db.query("SELECT * FROM ligne_panier WHERE ID_commande = ?",
      [ID_commande], (error, result) => {
    if (error){
      return res.status(500).json({message: "Erreur lors de la récupération des lignes de panier"})
    }
        console.log(result)
    res.json(result)
      })
})


module.exports = router;

