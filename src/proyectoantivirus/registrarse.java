package proyectoantivirus;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.sql.*;

public class registrarse extends JFrame {

    private JTextField nombresField;
    private JTextField apellidosField;
    private JTextField emailField;
    private JTextField celularField;
    private JPasswordField passwordField;
    private JPasswordField confirmPasswordField;

    public registrarse() {
        setTitle("ANTIVIRUS - Registrarse");
        setSize(400, 500);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null); // Centrar la ventana

        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 30, 20, 30));

        JLabel titulo = new JLabel("ANTIVIRUS");
        titulo.setFont(new Font("Arial", Font.BOLD, 24));
        titulo.setAlignmentX(Component.CENTER_ALIGNMENT);
        panel.add(titulo);

        JLabel subtitulo = new JLabel("Registrarse");
        subtitulo.setFont(new Font("Arial", Font.PLAIN, 18));
        subtitulo.setAlignmentX(Component.CENTER_ALIGNMENT);
        panel.add(subtitulo);
        panel.add(Box.createRigidArea(new Dimension(0, 15)));

        nombresField = addInput(panel, "Nombres:");
        apellidosField = addInput(panel, "Apellidos:");
        emailField = addInput(panel, "Correo Electrónico:");
        celularField = addInput(panel, "Celular:");
        passwordField = addPassword(panel, "Contraseña:");
        confirmPasswordField = addPassword(panel, "Confirmar Contraseña:");

        JButton registrarBtn = new JButton("Registrarse");
        registrarBtn.setAlignmentX(Component.CENTER_ALIGNMENT);
        registrarBtn.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                registrarUsuario();
            }
        });

        panel.add(Box.createRigidArea(new Dimension(0, 10)));
        panel.add(registrarBtn);

        add(panel);
    }

    private JTextField addInput(JPanel panel, String labelText) {
        JLabel label = new JLabel(labelText);
        JTextField textField = new JTextField(20);
        panel.add(label);
        panel.add(textField);
        panel.add(Box.createRigidArea(new Dimension(0, 10)));
        return textField;
    }

    private JPasswordField addPassword(JPanel panel, String labelText) {
        JLabel label = new JLabel(labelText);
        JPasswordField passField = new JPasswordField(20);
        panel.add(label);
        panel.add(passField);
        panel.add(Box.createRigidArea(new Dimension(0, 10)));
        return passField;
    }

    private void registrarUsuario() {
        String nombre = nombresField.getText();
        String apellidos = apellidosField.getText();
        String correo = emailField.getText();
        String celular = celularField.getText();
        String contraseña = new String(passwordField.getPassword());
        String confirmarContraseña = new String(confirmPasswordField.getPassword());

        if (!contraseña.equals(confirmarContraseña)) {
            JOptionPane.showMessageDialog(this, "Las contraseñas no coinciden.", "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }

        try (Connection conn = ConexionBD.obtenerConexion()) {
            if (conn == null) {
                JOptionPane.showMessageDialog(this, "Error al conectar con la base de datos.", "Error", JOptionPane.ERROR_MESSAGE);
                return;
            }

            // Verificar si ya existe un usuario con ese correo
            String consultaCorreo = "SELECT id FROM usuarios1 WHERE correo = ?";
            PreparedStatement psVerificar = conn.prepareStatement(consultaCorreo);
            psVerificar.setString(1, correo);
            ResultSet rs = psVerificar.executeQuery();

            if (rs.next()) {
                JOptionPane.showMessageDialog(this, "El correo ya está registrado.", "Advertencia", JOptionPane.WARNING_MESSAGE);
                return;
            }

            String sql = "INSERT INTO usuarios1 (nombre, apellidos, correo, celular, contraseña) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, nombre);
            stmt.setString(2, apellidos);
            stmt.setString(3, correo);
            stmt.setString(4, celular);
            stmt.setString(5, contraseña);

            int filasInsertadas = stmt.executeUpdate();

            if (filasInsertadas > 0) {
                JOptionPane.showMessageDialog(this, "Usuario registrado correctamente.");
                limpiarCampos();
            } else {
                JOptionPane.showMessageDialog(this, "No se pudo registrar el usuario.", "Error", JOptionPane.ERROR_MESSAGE);
            }

        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error en la base de datos: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
            ex.printStackTrace();
        }
    }

    private void limpiarCampos() {
        nombresField.setText("");
        apellidosField.setText("");
        emailField.setText("");
        celularField.setText("");
        passwordField.setText("");
        confirmPasswordField.setText("");
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new registrarse().setVisible(true);
        });
    }
}
