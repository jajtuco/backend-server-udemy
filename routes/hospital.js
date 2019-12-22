var express = require('express');
var mdAutenticacion = require('../middelwares/autenticacion');


var app = express();

var Hospital = require('../models/hospital');

// ===================================
// Obtener todos los hospitales
// ===================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde | 0;
    desde = Number(desde);

    Hospital.find({})
        .limit(5)
        .skip(desde)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        hospitales: hospitales
                    });
                });

            });



});

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: {
                        message: 'No existe un hospitalcon ese ID'
                    }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
});

// ===================================
// Actualizar hospitales
// ===================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {


            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }



            res.status(200).json({
                ok: true,
                body: hospitalGuardado
            });

        });


    });

});



// ===================================
// Crear un nuevo hospital
// ===================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body; //Funciona solo si tenemos el body parser

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            body: hospitalGuardado
        });

    });

});



// ===================================
// Borrar un hopital por el ID
// ===================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }


        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ID ' + id,
                errors: { message: 'No existe hospital con ID ' + id }
            });
        }


        res.status(200).json({
            ok: true,
            body: hospitalBorrado
        });


    });


});



module.exports = app;