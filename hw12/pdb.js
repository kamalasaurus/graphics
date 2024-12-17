import Module from './mkdssp.js';

/* atom {
  record, serial, atm, residue, chain, residue_sequence,
  x, y, z, occupancy, b, element, secondaryStructure,
  distance, select, toString, toObject
}
*/
export class Atom {
  constructor(args = {record, serial, atm, residue, chain, residue_sequence,
    x, y, z, occupancy, b, element, /*secondaryStructure*/}) {
    Object.assign(this, args); // I've impressed myself with my destructuring skills
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
  static moduleInstance = null;

  #pdb
  #atoms
  #secondaryStructures
  #helices
  #sheets

  constructor(pdb) {
    this.#pdb = pdb;
    //const result = this.#generateSecondaryStructures();
    // this.#secondaryStructures = result.secondaryStructures;
    // this.#helices = result.helices;
    // this.#sheets = result.sheets;
    this.#atoms = this.#parseAtoms();
    console.log(this.atoms);
  }

  static async initializeModule() {
    if (!PDB.moduleInstance) {
      PDB.moduleInstance = await Module();
    }
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

  async #generateSecondaryStructures() {
    const pdbString = this.toString();

    // Ensure FS is available
    const { FS, callMain } = PDB.moduleInstance;

    if (!FS) {
      throw new Error("FS module not available");
    }

    // Create a temporary file in the virtual filesystem
    const inputFileName = '/input.pdb';
    const outputFileName = '/output.dssp';
    FS.writeFile(inputFileName, pdbString);

    const tmp = FS.readFile(inputFileName, { encoding: 'utf8' });

    // Run mkdssp with the input file and capture the output
    const args = [inputFileName, outputFileName];
    callMain(args);

    // Read the output file from the virtual filesystem
    const result = FS.readFile(outputFileName, { encoding: 'utf8' });
    console.log("mkdssp result:", result);

    // Parse the result as needed
    const secondaryStructures = this.#parseDSSP(result);
    return { secondaryStructures };
  }

  #parseDSSP(dsspOutput) {
    // Implement parsing logic for DSSP output
    // This is a placeholder implementation
    const secondaryStructures = [];
    const lines = dsspOutput.split('\n');
    for (const line of lines) {
      if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
        const [record, serial, structure] = line.split(/\s+/);
        secondaryStructures.push({ serial: parseInt(serial), structure });
      }
    }
    return secondaryStructures;
  }

  toString() {
    return this.#pdb;
  }

  #parseAtoms() {
    // get all the atoms from this.pdb
    // return an array of atom objects

    const atoms = [];
    const lines = this.#pdb.split("\n");

    for (const line of lines) {
      if (line.startsWith("ATOM") || line.startsWith("HETATM")) {
        const [ record, serial, atm, residue, chain, residue_sequence,
          x, y, z, occupancy, b, element ] = line.split(/\s+/);

        // const secondaryStructure = this.#secondaryStructures.find(ss => ss.serial === parseInt(serial))?.structure || "";

        const atom = new Atom({
          record,
          serial: parseInt(serial),
          atm,
          element,
          residue,
          chain,
          residue_sequence: parseInt(residue_sequence),
          coordinates: {
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z)
          },
          occupancy: parseFloat(occupancy),
          b: parseFloat(b),
          // secondaryStructure
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

  get helices() {
    return this.#helices;
  }

  get sheets() {
    return this.#sheets;
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

// Initialize the mkdssp module when the class is first loaded
PDB.initializeModule();

export default { Atom, PDB };