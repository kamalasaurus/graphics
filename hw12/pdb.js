/* atom {
  name, element, residue, chain, coordinates, bonds,
  secondaryStructure, distance, select, toString, toObject
}
*/
export class Atom {
  constructor(args = {name, element, residue, chain, coordinates}) {
    Object.assign(this, args); // I've impressed myself with my destructuring skills
    this.bonds = [];
    this.secondaryStructure = "";
  }

  distance(atom) {
    const x = this.coordinates.x - atom.coordinates.x;
    const y = this.coordinates.y - atom.coordinates.y;
    const z = this.coordinates.z - atom.coordinates.z;
    return Math.sqrt(x * x + y * y + z * z);
  }

  select(query) {
    return query(this);
  }

  toString() {
    return `${this.name} ${this.element} ${this.residue} ${this.chain} ${this.coordinates}`;
  }

  toObject() {
    return {
      name: this.name,
      element: this.element,
      residue: this.residue,
      chain: this.chain,
      coordinates: this.coordinates
    };
  }
}

export class PDB {
  #pdb
  #atoms

  constructor(pdb) {
    this.#pdb = pdb;
    this.#atoms = this.#parseAtoms();
    console.log(this.atoms);
  }

  static async fromFile(file) {
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
    return new PDB(data);
  }

  toString() {
    return this.pdb;
  }

  // rcsb does not accept cors headers from the client.  So, if this ever becomes
  // a server-side application via electron or something, this would be the way to go.
  // static async fetchPDB (pdbId) {
  //   const url = `https://files.rcsb.org/download/${pdbId}.pdb`;

  //   try {
  //       const response = await fetch(url);
  //       if (!response.ok) {
  //           throw new Error(`HTTP error! Status: ${response.status}`);
  //       }
  //       const data = await response.text();
  //       return new PDB(data);
  //   } catch (error) {
  //       console.error("Error fetching the PDB file:", error);
  //   }
  // }

  #parseAtoms() {
    // get all the atoms from this.pdb
    // return an array of atom objects

    const atoms = [];
    const lines = this.pdb.split("\n");

    for (const line of lines) {
      if (line.startsWith("ATOM") || line.startsWith("HETATM")) {
        const parts = line.split(/\s+/);
        const atom = new Atom({
          name: parts[2],
          element: parts[11],
          residue: parts[3],
          chain: parts[4],
          coordinates: {
            x: parseFloat(parts[6]),
            y: parseFloat(parts[7]),
            z: parseFloat(parts[8])
          }
        });
        atoms.push(atom);
      }
    }

    return atoms;
  }

  get pdb() {
    return this.#pdb;
  }

  get atoms() {
    return this.#atoms;
  }

  residues() {
    const residues = this.atoms.reduce((residues, atom) => {
      const residue = residues.find((residue) => residue.name === atom.residue);
      if (residue) {
        residue.atoms.push(atom);
      } else {
        residues.push({
          name: atom.residue,
          atoms: [atom]
        });
      }
      return residues;
    }, []);

    return residues;
  }

  chains() {
    const chains = this.atoms.reduce((chains, atom) => {
      const chain = chains.find((chain) => chain.name === atom.chain);
      if (chain) {
        chain.atoms.push(atom);
      } else {
        chains.push({
          name: atom.chain,
          atoms: [atom]
        });
      }
      return chains;
    }, []);

    return chains;
  }

  centralAtoms() {
    return this.atoms.filter((atom) => atom.name === "CA");
  }

  coordinates() {
    return this.atoms.map((atom) => atom.coordinates);
  }

  bonds() {
    // ...existing code...
  }

  secondaryStructure() {
    // ...existing code...
  }

  distance(atom1, atom2) {
    // ...existing code...
  }

  select(query) {
    // ...existing code...
  }
}

export default { Atom, PDB };