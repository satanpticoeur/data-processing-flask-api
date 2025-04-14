import os

import numpy as np
import pandas as pd
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'static/uploads'


def get_extension(filename):
    return os.path.splitext(filename)[1]


def get_name(filename):
    return os.path.splitext(filename)[0]


def convert_to_csv(file):
    file_extension = get_extension(file.filename)
    output_path = os.path.join(UPLOAD_FOLDER, f"{get_name(file.filename)}_converted.csv")

    if file_extension == ".json":
        df = pd.read_json(file)
    elif file_extension == ".xml":
        df = pd.read_xml(file)
    else:
        return file

    df.to_csv(output_path, index=False)
    return output_path


def clean_file(file):
    try:
        converted_file = convert_to_csv(file)
        df = pd.read_csv(converted_file)
        print(df.head())

        # Traiter les valeurs manquantes
        df.ffill(inplace=True)  # Remplit avec la valeur précédente

        # Supprimer les doublons
        df.drop_duplicates(inplace=True)

        # Supprimer les valeurs aberrantes
        for col in df.select_dtypes(include=[np.number]).columns:
            # Suppression des valeurs aberrantes en utilisant l'IQR

            # On calcule Q1 et Q3
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)

            # Calculer l'écart interquartile (IQR)
            iqr = q3 - q1

            # Définir les bornes inférieure et supérieure à l'aide du Q1 et de l'IQR
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr

            # On garde les valeurs à l'intérieur de la borne inférieure et supérieure
            df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]

        # Normaliser les noms de colonnes
        df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

        cleaned_path = os.path.join(UPLOAD_FOLDER, f"{get_name(file.filename)}_cleaned.csv")
        df.to_csv(cleaned_path, index=False)

        return cleaned_path
    except Exception as e:
        print("Erreur lors du traitement :", e)
        return None


def save_file(file):
    file.save(f"{UPLOAD_FOLDER}/{secure_filename(file.filename)}")
