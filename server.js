<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saisie Emploi du Temps - CPET CATHOLIQUE SAINT JOSEPH BOHICON</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 20px; }
        .container { max-width: 1100px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #3b5998; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { margin: 0; color: #1a365d; font-size: 24px; text-transform: uppercase; }
        .header h2 { margin: 5px 0 0 0; color: #2c3e50; font-size: 18px; font-weight: normal; }
        .form-group { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 20px; }
        .form-group div { flex: 1; min-width: 200px; }
        label { display: block; font-weight: bold; margin-bottom: 5px; color: #2c3e50; }
        input[type="text"], input[type="tel"] { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; text-align: center; padding: 6px; font-size: 13px; }
        th { background-color: #3b5998; color: white; }
        td input { width: 90%; padding: 4px; border: 1px solid #ddd; border-radius: 3px; text-align: center; }
        
        /* Style pour les cases occupées */
        td input.occupied {
            background-color: #e2e8f0;
            color: #718096;
            font-weight: bold;
            border: 1px solid #cbd5e0;
            cursor: not-allowed;
        }

        .footer-signature { margin-top: 30px; text-align: right; padding-right: 20px; }
        .footer-signature p { margin: 2px 0; color: #2c3e50; }
        .footer-signature .title { font-weight: bold; text-transform: uppercase; font-size: 12px; }
        .footer-signature .name { font-weight: bold; font-size: 14px; margin-top: 35px; }
        .btn-group { display: flex; gap: 10px; margin-top: 20px; }
        .btn-submit { background-color: #3b5998; color: white; padding: 12px; font-weight: bold; border: none; border-radius: 4px; cursor: pointer; flex: 2; font-size: 16px; }
        .btn-reset { background-color: #e74c3c; color: white; padding: 12px; font-weight: bold; border: none; border-radius: 4px; cursor: pointer; flex: 1; font-size: 16px; }
        .btn-submit:hover { background-color: #2d4373; }
        .btn-reset:hover { background-color: #c0392b; }
        @media print {
            .btn-group { display: none !important; }
            body { background: white; margin: 0; }
            .container { box-shadow: none; padding: 0; max-width: 100%; }
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>CPET CATHOLIQUE SAINT JOSEPH BOHICON</h1>
        <h2>Emploi du temps individuel de l'enseignant</h2>
    </div>

    <form id="scheduleForm">
        <input type="hidden" id="editId" value="">
        <div class="form-group">
            <div>
                <label for="teacherName">Nom & Prénom :</label>
                <input type="text" id="teacherName" required placeholder="Ex: M. KOUANDÉ">
            </div>
            <div>
                <label for="subject">Matière / Classe :</label>
                <input type="text" id="subject" required placeholder="Ex: Mathématiques / 1ère F3">
            </div>
            <div>
                <label for="phone">Téléphone :</label>
                <input type="tel" id="phone" placeholder="Ex: +229 01 00 00 00">
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Horaires</th>
                    <th>Lundi</th>
                    <th>Mardi</th>
                    <th>Mercredi</th>
                    <th>Jeudi</th>
                    <th>Vendredi</th>
                </tr>
            </thead>
            <tbody id="scheduleBody"></tbody>
        </table>

        <div class="footer-signature">
            <p class="title">Le DAF / Le Préfet de Discipline</p>
            <p class="name">Père Edouard TONOU</p>
        </div>

        <div class="btn-group">
            <button type="submit" class="btn-submit" id="saveBtn">Enregistrer l'emploi du temps</button>
            <button type="button" class="btn-reset" onclick="resetForm()">Réinitialiser</button>
        </div>
    </form>
</div>

<script>
    const hours = [
        '07h00 - 08h00', '08h00 - 09h00', '09h00 - 10h00',
        '10h00 - 11h00', '11h00 - 12h00', '12h00 - 13h00',
        '13h00 - 14h00', '14h00 - 15h00', '15h00 - 16h00',
        '16h00 - 17h00', '17h00 - 18h00', '18h00 - 19h00'
    ];
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

    const tbody = document.getElementById('scheduleBody');
    hours.forEach(hour => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="font-weight:bold;">${hour}</td>` + 
            days.map(day => `<td><input type="text" data-day="${day}" data-hour="${hour}" placeholder="..."></td>`).join('');
        tbody.appendChild(tr);
    });

    // Charger les réservations existantes pour griser les cases déjà prises
    async function loadOccupiedSlots() {
        const editId = document.getElementById('editId').value;
        try {
            const res = await fetch('/api/schedules');
            const schedules = await res.json();

            // Réinitialiser les champs non modifiés
            const inputs = tbody.querySelectorAll('input');
            inputs.forEach(input => {
                input.classList.remove('occupied');
                input.disabled = false;
                if (!input.value || input.value === 'OCCUPÉ') {
                    input.value = '';
                }
            });

            // Parcourir les emplois du temps enregistrés
            schedules.forEach(item => {
                // Ne pas bloquer ses propres créneaux si l'enseignant est en train de modifier son propre fichier
                if (editId && (item.id === editId || item.id == editId)) return;

                if (item.schedule) {
                    days.forEach(day => {
                        if (item.schedule[day]) {
                            hours.forEach(hour => {
                                const val = item.schedule[day][hour];
                                if (val && val.trim() !== '') {
                                    const input = tbody.querySelector(`input[data-day="${day}"][data-hour="${hour}"]`);
                                    if (input) {
                                        input.value = 'OCCUPÉ';
                                        input.classList.add('occupied');
                                        input.disabled = true; // Bloque la saisie
                                    }
                                }
                            });
                        }
                    });
                }
            });
        } catch (err) {
            console.error('Erreur lors du chargement des créneaux:', err);
        }
    }

    function resetForm() {
        document.getElementById('scheduleForm').reset();
        document.getElementById('editId').value = '';
        document.getElementById('saveBtn').innerText = "Enregistrer l'emploi du temps";
        loadOccupiedSlots();
    }

    async function checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        if (editId) {
            try {
                const res = await fetch('/api/schedules');
                const schedules = await res.json();
                const item = schedules.find(s => s.id === editId || s.id == editId);
                if (item) {
                    document.getElementById('editId').value = item.id;
                    document.getElementById('teacherName').value = item.teacherName || '';
                    document.getElementById('subject').value = item.subject || '';
                    document.getElementById('phone').value = item.phone || '';

                    await loadOccupiedSlots();

                    const inputs = tbody.querySelectorAll('input');
                    inputs.forEach(input => {
                        const day = input.dataset.day;
                        const hour = input.dataset.hour;
                        if (item.schedule && item.schedule[day] && item.schedule[day][hour]) {
                            input.value = item.schedule[day][hour];
                            input.disabled = false;
                            input.classList.remove('occupied');
                        }
                    });
                    document.getElementById('saveBtn').innerText = "Mettre à jour l'emploi du temps";
                    return;
                }
            } catch (err) {
                console.error(err);
            }
        }
        loadOccupiedSlots();
    }

    document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const editId = document.getElementById('editId').value;
        const teacherName = document.getElementById('teacherName').value;
        const subject = document.getElementById('subject').value;
        const phone = document.getElementById('phone').value;

        const schedule = {};
        days.forEach(day => schedule[day] = {});

        const inputs = tbody.querySelectorAll('input');
        inputs.forEach(input => {
            const day = input.dataset.day;
            const hour = input.dataset.hour;
            const val = input.value.trim();
            // N'enregistre la case que si le champ est rempli et NON verrouillé ("OCCUPÉ")
            if (val && !input.disabled && val !== 'OCCUPÉ') {
                schedule[day][hour] = val;
            }
        });

        const payload = { teacherName, subject, phone, schedule };
        const url = editId ? `/api/schedules/${editId}` : '/api/schedules';
        const method = editId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editId ? 'Modifications enregistrées !' : 'Emploi du temps enregistré !');
                if (editId) {
                    window.location.href = '/admin.html';
                } else {
                    resetForm();
                }
            } else {
                const data = await res.json();
                alert("Erreur :\n" + (data.error || "Impossible d'enregistrer cet emploi du temps."));
            }
        } catch (err) {
            console.error(err);
            alert("Erreur de connexion au serveur.");
        }
    });

    checkEditMode();
</script>

</body>
</html>
