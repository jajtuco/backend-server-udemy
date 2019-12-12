var express = require('express');
var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middelwares/autenticacion');


var app = express();

var Usuario = require('../models/usuario');

// ===================================
// Obtener todos los usuarios
// ===================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde | 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                Usuario .count({}, (err, conteo)=> {

                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        usuarios: usuarios
                    });

                });

            });



});


// ===================================
// Actualizar usuarios
// ===================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {


            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }


            usuarioGuardado.password = "";

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });


    });

});



// ===================================
// Crear un nuevo usuarios
// ===================================
app.post('/', (req, res) => {

    var body = req.body; //Funciona solo si tenemos el body parser

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            body: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});



// ===================================
// Borrar un usuario por el ID
// ===================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res)=>{

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }


        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ID '+ id,
                errors: { message: 'No existe usuario con ID '+ id}
            });
        }


        res.status(200).json({
            ok: true,
            body: usuarioBorrado
        });


    });


});



module.exports = app;