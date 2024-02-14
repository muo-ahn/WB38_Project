import yaml

# YAML 파일 로드(질병 관련)
with open('actions\\Disease_info.yml', 'r', encoding='utf-8') as file:
    yaml_data = yaml.safe_load(file)
    
disease_data = yaml_data['sk05']['disease']

print(disease_data)