const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vsva9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const inventoryCollection = client.db("Warehouse").collection("inventory");

    //INVENTORY API
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventory = await cursor.toArray();
      res.send(inventory);
    });

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await inventoryCollection.findOne(query);
      res.send(service);
    });
    //update inventory

    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updatedStock = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDocument = {
        $set: updatedStock,
      };

      //add item
      app.post("/addItem", async (req, res) => {
        const newItem = req.body;
        const result = await inventoryCollection.insertOne(newItem);
        res.send(result);
      });

      //DELETE
      app.delete("/inventory/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await inventoryCollection.deleteOne(query);
        res.send(result);
      });

      const result = await inventoryCollection.updateOne(
        filter,
        updateDocument,
        options
      );

      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

// root api
app.get("/", (req, res) => {
  res.send("Management server is running");
});

app.listen(port, () => {
  console.log("Listening to ", port);
});
