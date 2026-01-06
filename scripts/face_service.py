import sys
import os
import json
import numpy as np
from deepface import DeepFace

EMBEDDINGS_FILE = 'embeddings.json'
LABEL_MAP_FILE = 'label_map.json'

def load_state():
    embeddings = []
    label_map = {}
    if os.path.exists(EMBEDDINGS_FILE):
        try:
            with open(EMBEDDINGS_FILE, 'r') as f:
                embeddings = json.load(f)
        except Exception:
            embeddings = []
    if os.path.exists(LABEL_MAP_FILE):
        try:
            with open(LABEL_MAP_FILE, 'r') as f:
                label_map = json.load(f)
        except Exception:
            label_map = {}
    return embeddings, label_map

def save_state(embeddings, label_map):
    tmp_e = EMBEDDINGS_FILE + '.tmp'
    tmp_l = LABEL_MAP_FILE + '.tmp'
    with open(tmp_e, 'w') as f:
        json.dump(embeddings, f)
    with open(tmp_l, 'w') as f:
        json.dump(label_map, f, indent=2)
    os.replace(tmp_e, EMBEDDINGS_FILE)
    os.replace(tmp_l, LABEL_MAP_FILE)

def represent(image_path):
    try:
        reps = DeepFace.represent(img_path=image_path, model_name='SFace', detector_backend='skip', enforce_detection=False)
        if isinstance(reps, list) and len(reps) > 0:
            emb = reps[0]['embedding'] if isinstance(reps[0], dict) and 'embedding' in reps[0] else reps[0]
            return np.array(emb, dtype=np.float32)
        return None
    except Exception:
        return None

def cosine(a, b):
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 1.0
    return 1.0 - float(np.dot(a, b) / (na * nb))

def train(name, image_paths):
    embeddings, label_map = load_state()
    label_id = -1
    for k, v in label_map.items():
        if v == name:
            label_id = int(k)
            break
    if label_id == -1:
        label_id = 1 if not label_map else max([int(i) for i in label_map.keys()]) + 1
        label_map[str(label_id)] = name
    added = 0
    for p in image_paths:
        emb = represent(p)
        if emb is not None:
            embeddings.append({'label_id': int(label_id), 'embedding': emb.tolist()})
            added += 1
    if added == 0:
        print(json.dumps({"success": False, "message": "No embeddings produced"}))
        return
    save_state(embeddings, label_map)
    print(json.dumps({"success": True, "message": f"Trained {added} images for {name}", "label_id": label_id}))

def recognize(image_path):
    try:
        db = os.path.join(os.getcwd(), 'uploads')
        res = DeepFace.find(img_path=image_path, db_path=db, model_name='SFace', detector_backend='skip', enforce_detection=False)
        rows = []
        try:
            if isinstance(res, list):
                for r in res:
                    try:
                        rows.extend(r.to_dict('records'))
                    except:
                        pass
            else:
                rows = res.to_dict('records')
        except:
            rows = []
        if not rows:
            print(json.dumps({"success": False, "message": "Unknown person"}))
            return
        top = sorted(rows, key=lambda x: float(x.get('distance', 1e9)))[0]
        identity = str(top.get('identity', ''))
        dist = float(top.get('distance', 1.0))
        path_norm = identity.replace('\\', '/')
        parts = path_norm.split('/')
        name = parts[parts.index('uploads') + 1] if 'uploads' in parts and parts.index('uploads') + 1 < len(parts) else os.path.basename(os.path.dirname(path_norm))
        threshold = 0.35
        unknown = bool(dist > threshold)
        if unknown:
            name = "Unknown"
        result = {
            "success": True,
            "name": name,
            "confidence": dist,
            "unknown": unknown
        }
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "message": "Recognition failed", "error": str(e)}))

def rebuild():
    faces_path = os.path.join(os.getcwd(), 'faces.json')
    entries = []
    if os.path.exists(faces_path):
        try:
            with open(faces_path, 'r') as f:
                entries = json.load(f)
        except Exception:
            entries = []
    embeddings = []
    label_map = {}
    for entry in entries:
        try:
            name = entry.get('name')
            lid = int(entry.get('label_id'))
            label_map[str(lid)] = name
            for web_path in entry.get('imagePaths', []):
                p = web_path.replace('\\', '/')
                if p.startswith('/uploads/'):
                    disk_path = os.path.join(os.getcwd(), 'uploads', os.path.basename(p))
                elif p.startswith('uploads/'):
                    disk_path = os.path.join(os.getcwd(), p.replace('/', os.sep))
                else:
                    disk_path = os.path.join(os.getcwd(), p)
                emb = represent(disk_path)
                if emb is not None:
                    embeddings.append({'label_id': int(lid), 'embedding': emb.tolist()})
        except Exception:
            continue
    save_state(embeddings, label_map)
    print(json.dumps({"success": True, "message": f"Rebuilt model with {len(embeddings)} samples"}))

def stream():
    try:
        db = os.path.join(os.getcwd(), 'uploads')
        DeepFace.stream(db_path=db, model_name='SFace', detector_backend='retinaface', enable_face_analysis=False, source=0)
        print(json.dumps({"success": True, "message": "Stream ended"}))
    except Exception as e:
        print(json.dumps({"success": False, "message": "Stream failed", "error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python face_service.py <command> [args...]")
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "train":
        name = sys.argv[2]
        images = sys.argv[3:]
        train(name, images)
    elif cmd == "recognize":
        image_path = sys.argv[2]
        recognize(image_path)
    elif cmd == "rebuild":
        rebuild()
    elif cmd == "stream":
        stream()
    else:
        print(f"Unknown command: {cmd}")
