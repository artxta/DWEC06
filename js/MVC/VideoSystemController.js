"use strict";

class VideoSystemController {
  // propiedades privadas
  #MODEL;
  #VIEW;

  constructor(model, view) {
    this.#MODEL = model;
    this.#VIEW = view;
    // pintar las categorias al iniciar
    this.#VIEW.bindLoad(this.handleInit); // despues de cargar datos
    this.#VIEW.bindInit(this.handleInit);  // al pulsar el inicio o Logo

    this.#VIEW.bindShowFichaDirector(this.handleShowFichaDirector); // showFichaDirector - mostrar la ficha del director
    this.#VIEW.bindShowFichaActor(this.handleShowFichaActor); // showFichaActor - mostrar la ficha del actor
    this.#VIEW.bindGetProductionsInCategory(this.handleGetProductionsInCategory); // getProductionsInCategory - mostrar producciones de una categoria
    this.#VIEW.bindShowFichaProduction(this.handleShowFichaProduction); // showFichaProduction - mostrar ficha produccion
    this.#VIEW.bindNewWindow(this.handleOpenInNewWindow); // abrir fichas en nueva ventana , arreglado para history
    this.#VIEW.bindShowModal(this.handleShowModal); // devolver datos para crear nueva produccion, borrar , asignar, etc

    // añadir evento del historial
    window.addEventListener("popstate", (event) => {
      this.handlePopstate(event);
    });

  }

  // manejadores handle

  // manejador despues de la carga, inicia el metodo onInit()
  handleInit = () => {
    // añade el estado inicial al history
    if (!history.state) {
      this.addHistory({ action: 'init' }); // 
    }
    this.onInit(this.#MODEL.categories, this.#MODEL.directors, this.#MODEL.actors, this.#MODEL.productions);
  }

  /**
   * Añade al historial
   * @param {*} objetoDatos 
   */
  addHistory = (objetoDatos) => {
    try {
      console.log(">Añadir a history: ");
      console.dir(objetoDatos);
      // evitar que al hacer click se vuelva a hacer pushstate
      if (
        history.state?.clave !== objetoDatos.clave ||
        history.state?.action !== objetoDatos.action
      ) {
        history.pushState(objetoDatos, null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // handle de bindShowModal
  handleShowModal = (datos) => {
    switch (datos) {
      // devolver las categorias
      case "categorias":
        // mostrar las categorias disponibles en el modal
        this.#VIEW.showModal("produccion", this.#MODEL.categories);
        break;
      case "actoresDirectores":
        // cargar los selectores de actores y directores de la produccion
        this.#VIEW.showModal("tresProduction", [], this.#MODEL.actors, this.#MODEL.directors);
        break;
      default:
        return null;
    }
  }

  /**
   * atras/delante del historial
   * @param {*} event 
   */
  handlePopstate = (event) => {
    if (event.state) {
      console.log(">Restaurar history: ");
      console.dir(event.state);

      // variables
      const action = event.state.action;

      // buscar y devolver objeto por clave
      const clave = event.state.clave;


      // acciones
      //  restaurar ver ficha Director
      if (action === 'showFichaDirector') {
        // busca y devuelve el objeto original director y el array productions
        for (const d of this.#MODEL.directors) {
          if (clave === (d.name + "_" + d.lastname1)) {
            const productions = Array.from(this.#MODEL.getProductionsDirector(d));

            this.#VIEW.showFichaDirector(d, productions);
            break;
          }
        }
        // restaurar ver ficha actor
      } else if (action === 'showFichaActor') {
        // busca y devuelve el objeto original actor y el array productions
        for (const a of this.#MODEL.actors) {
          if (clave === (a.name + "_" + a.lastname1)) {
            // obtener producciones de ese actor, no guardar array en history, me da problemass
            const productions = Array.from(this.#MODEL.getProductionsActor(a));
            // mostrarlo
            this.#VIEW.showFichaActor(a, productions);
            break;
          }
        }

        // restaurar ver producciones de categoria
      } else if (action === 'getProductionsInCategory') {
        // buscar esa categoria y devolverla desde el popstate
        for (const c of this.#MODEL.categories) {
          if (clave === c.name) {
            // devolver la categoria para verla
            console.dir(c);
            this.#VIEW.listProductions(this.#MODEL.getProductionsCategory(c), c.name);
            break;
          }
        }

        // restaurar ver ficha produccion
      } else if (action === 'showFichaProduction') {

        let directores = [];
        // buscar esa produccion y devolverla
        for (const p of this.#MODEL.productions) {
          // devolver la producción para verla
          if (clave === p.title) {
            // directores no hay metodos para devolver directamente el director
            for (const dir of this.#MODEL.directors) {
              for (const pro of this.#MODEL.getProductionsDirector(dir)) {
                // añadir director
                if (clave === pro.title) directores.push(dir);

              }
            }
            const actores = Array.from(this.#MODEL.getCast(p));
            this.#VIEW.showFichaProduction(p, actores, directores);
            break;
          }
        }

      } else if (action === 'init') {
        this.onInit(this.#MODEL.categories, this.#MODEL.directors, this.#MODEL.actors, this.#MODEL.productions);
      }

    } else {
      // Si no hay estado, volver a la vista inicial
      this.onInit(this.#MODEL.categories, this.#MODEL.directors, this.#MODEL.actors, this.#MODEL.productions);
    }

  }

  /**
   * Mostrar ficha director
   * @param {*} keyDirector 
   * @returns 
   */
  handleShowFichaDirector = (keyDirector) => {
    try {
      let director;
      let productions;

      // buscar el director
      for (const d of this.#MODEL.directors) {
        const key = d.name + "_" + d.lastname1;
        if (key === keyDirector) {
          director = d;
        }
      }
      //  si no hay directores
      if (!director) return null;
      productions = Array.from(this.#MODEL.getProductionsDirector(director));
      // historial
      this.addHistory({
        action: 'showFichaDirector',
        clave: director.name + "_" + director.lastname1,
      });
      // devolver datos
      return { director, productions }

    } catch (e) {
      console.error(e);
    }
  }


  /**
   * devuelve un objeto tipo {objActor, [producciones]}
   * @param {*} keyActor 
   */
  handleShowFichaActor = (keyActor) => {
    try {
      let actor;
      let productions;

      // buscar el actor
      for (const a of this.#MODEL.actors) {
        const key = a.name + "_" + a.lastname1;
        if (key === keyActor) {
          actor = a;
        }
      }
      // convierte las producciones a array
      productions = Array.from(this.#MODEL.getProductionsActor(actor));
      // historial usa una clave unica para cada actor
      this.addHistory({
        action: 'showFichaActor',
        clave: actor.name + "_" + actor.lastname1,

      });
      // devolver datos
      return { actor, productions };
    } catch (e) {
      console.error(e);
    }
  }


  /**
   * obtener las producciones de una categoria
   */
  handleGetProductionsInCategory = (nombreCategoria) => {
    // buscar la categoria con ese nombre
    for (const cat of this.#MODEL.categories) {
      if (cat.name === nombreCategoria) {
        // historial
        this.addHistory({
          action: 'getProductionsInCategory',
          clave: cat.name
        });
        // si lo ha encontrado devuelve las producciones
        return this.#MODEL.getProductionsCategory(cat);
      }
    }
    // si no lo ha encontrado devuelve un array vacio
    return [];
  }

  /**
   * del titulo de una producción devuelve un objeto literal con 
 * obj produccion,
 * array actores,
 * array directores
 */
  handleShowFichaProduction = (nombreProduction) => {
    try {

      // buscar el objeto entre las producciones
      let produccion;
      let actores = [];
      let directores = [];
      for (const pro of this.#MODEL.productions) {
        if (pro.title === nombreProduction) {
          produccion = pro;
        }
      }
      // actores - convertir a Array
      actores = Array.from(this.#MODEL.getCast(produccion));
      // directores no hay metodos para devolver directamente el director
      for (const dir of this.#MODEL.directors) {
        for (const pro of this.#MODEL.getProductionsDirector(dir)) {
          // añadir director
          if (pro.title === nombreProduction) directores.push(dir);
        }
      }
      // historial
      this.addHistory({
        action: 'showFichaProduction',
        clave: produccion.title,
      });
      // devolver objeto
      return { produccion, actores, directores };

    } catch (e) {
      console.error(e);
    }
  }

  /**
   * segun la ficha que se quiera abrie en nueva ventana, devuelve unos datos o otros
   * @param {*} tipo 
   * @param {*} key 
   * @returns 
   */
  handleOpenInNewWindow = (tipo, key) => {

    // si la ficha es produccion
    if (tipo === "production") {
      let produccion;
      const actores = [];
      const directores = [];

      for (const pro of this.#MODEL.productions) {
        if (pro.title === key) {
          produccion = pro;
          break;
        }
      }

      if (!produccion) return null;
      // añade los datos de los actores
      for (const actor of this.#MODEL.getCast(produccion)) {
        actores.push(actor);
      }
      // añade los datos de los directores
      for (const dir of this.#MODEL.directors) {
        for (const pro of this.#MODEL.getProductionsDirector(dir)) {
          if (pro.title === key) {
            directores.push(dir);
          }
        }
      }
      // devuelve los datos para mostrar ficha produccion
      return {
        produccion,
        actores,
        directores,
        popupKey: produccion.title,
      };
    }

    // si es del tipo actor
    if (tipo === "actor") {
      let actor;

      // busca el actor
      for (const item of this.#MODEL.actors) {
        if (`${item.name}_${item.lastname1}` === key) {
          actor = item;
          break;
        }
      }

      if (!actor) return null;

      // devuelve los datos parra mostrar la ficha del actor
      return {
        actor,
        productions: Array.from(this.#MODEL.getProductionsActor(actor)),
        popupKey: `${actor.name}_${actor.lastname1}`,
      };
    }

    // si es del tipo director
    if (tipo === "director") {
      let director;

      // busca el director
      for (const item of this.#MODEL.directors) {
        if (`${item.name}_${item.lastname1}` === key) {
          director = item;
          break;
        }
      }

      if (!director) return null;
      // devuelve los datos para mostrar la ficha del director
      return {
        director,
        productions: Array.from(this.#MODEL.getProductionsDirector(director)),
        popupKey: `${director.name}_${director.lastname1}`,
      };
    }

    return null;
  }




  // metodos
  /**
   * crea la Vista inicial
  */
  onInit = (categories, directors, actors, productions) => {
    // obtener las categorias
    const cat = [...categories];
    const dir = [...directors];
    const act = [...actors];
    const pro = [...productions]

    this.#VIEW.init(cat, dir, act, pro);


  };

  /**
   * Carga los datos iniciales, los carga desde App, una vez al inicio
   * @param {*} datos 
   */
  onLoad = (datos) => {
    /*
  estructura de datos
   
  const datos = {
  users: [ {username: "",email: "",pass: ""},],
  categories: [
    {
      name: "",
      description: "",
      productions: [
        {
          title: "",
          fecha: new Date(),
          nac: "",
          synopsis: "",
          actores: [ { name: "", lastN: "", born: new Date() }, ],
          director: [ { name: "", lastN: "", born: new Date() },]
        }, 
      ]
    },
  ],
  };
  */
    try {

      const users = datos.users;
      const categories = datos.categories;
      // añadir usuarios
      for (const u of users) {
        this.#MODEL.addUser(this.#MODEL.createUser(u.username, u.email, u.pass));
      }

      // añadir categorias
      for (const cat of categories) {
        // crear y añadir categoria
        // crear
        const catCreada = this.#MODEL.createCategory(cat.name, cat.description);
        // guardar
        this.#MODEL.addCategory(catCreada);

        // añadir todas producciones de la categoria
        for (const pro of cat.productions) {

          // atributos que pueden o no pueden estar
          const nationality = pro.nac || "";
          const synopsis = pro.synopsis || "";
          const image = pro.image || "";
          const resources = pro.resources || [];
          const locations = pro.locations || [];
          const seasons = pro.seasons || 0;
          // crear
          const proCreada = this.#MODEL.createProduction(
            pro.title,
            pro.fecha,
            nationality,
            synopsis,
            image,
            resources,
            locations,
            seasons);
          // guardar
          this.#MODEL.addProduction(proCreada);
          // asignar la categoria actual la producción actual
          this.#MODEL.assignCategory(catCreada, proCreada);

          // crear y añadir todos los actores de cada produccion
          for (const act of pro.actores) {
            const actCreado = this.#MODEL.createPerson(act.name, act.lastN, act.born);
            this.#MODEL.addActor(actCreado);
            // assignar a este actor la producción actual
            this.#MODEL.assignActor(actCreado, proCreada);
          }
          // crear y añadir todos los directores de cada producción
          for (const dir of pro.director) {
            const dirCreado = this.#MODEL.createPerson(dir.name, dir.lastN, dir.born);
            this.#MODEL.addDirector(dirCreado);
            // assignar a este director la producción actual
            this.#MODEL.assignDirector(dirCreado, proCreada);
          }
        }
      }


      // función para test
      // function test(model) {

      //   // mostrar estructura de datos en console.log
      //   console.log("Mostrar usuario: ");
      //   console.dir(Array.from(model.users)[0]);


      //   console.log("Mostrar estructura: ");
      //   // obtener categorias
      //   for (const cat of model.categories) {
      //     const categorias = model.getProductionsCategory(cat);
      //     console.log("-Categoria: " + cat.name);
      //     console.log("  -Producciones: ");
      //     // obtener productions de cada categoria
      //     for (const pro of categorias) {
      //       console.log("    -" + pro.title);
      //       // obtener actores de cada categoria: 
      //       const actores = model.getCast(pro);
      //       console.log("      -Actores:");
      //       for (const actor of actores) {
      //         console.log("        -" + actor.name + " " + actor.lastname1);
      //       }
      //       // en Tarea 4 no hay metodo para devolver director teniendo Producción
      //       let varDirector;
      //       //  recorrer produciones de director
      //       for (const director of model.directors) {
      //         for (const proDirector of model.getProductionsDirector(director)) {
      //           if (proDirector.title === pro.title) varDirector = director;
      //         }
      //       }
      //       console.log("      -Director: " + varDirector.name + " " + varDirector.lastname1);
      //     }
      //   }
      // }
      // // ejecutar tests
      // // test(this.#MODEL);

    } catch (e) {
      console.error(e);
    }
  };

}


// exportar clase
export default VideoSystemController;