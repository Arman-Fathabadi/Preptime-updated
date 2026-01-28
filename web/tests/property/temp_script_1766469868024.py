import sys
import json
sys.path.insert(0, r'C:\Users\seyed\OneDrive\Desktop\PrepTime\shared')
from models import Task

try:
    with open(r'C:\Users\seyed\OneDrive\Desktop\PrepTime\web\tests\property\temp_data_1766469868024.json', 'r') as f:
        data = json.load(f)
    obj = Task(**data)
    print('VALID')
except Exception as e:
    print(f'INVALID: {str(e)}')
