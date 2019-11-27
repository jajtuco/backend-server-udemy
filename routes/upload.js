var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // ***** Validación: Tipos de coleccion *****
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no válida',
            errors: { message: 'Las colecciones váldias son ' + tiposValidos.join(', ') }
        });
    }


    // ***** Validación: No hay archivo *****
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó archivo',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // ***** Validación: Extensión de archivo *****
    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones aceptamos
    var extesionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extesionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones váldias son ' + extesionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo de un temporal a un path especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido'
        // });

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {


            if(!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe'}
                });
            }


            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo, err => {
                    if( err ){
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al eliminar la imagen del usuario',
                            errors: err
                        });
                    }
                });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usario actualizada',
                    usuario: usuarioActualizado
                });

            })


        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if(!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Médico no existe',
                    errors: { message: 'Medico no existe'}
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo, err => {
                    if( err ){
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al eliminar la imagen del médico',
                            errors: err
                        });
                    }
                });

            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });

            });


        });


    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if(!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe'}
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo, err => {
                    if( err ){
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al eliminar la imagen del hospital',
                            errors: err
                        });
                    }
                });
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    hospital: hospitalActualizado
                });

            });


        });
    }


}


module.exports = app;