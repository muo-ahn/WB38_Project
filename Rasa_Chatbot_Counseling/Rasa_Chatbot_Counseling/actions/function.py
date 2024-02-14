#function.py
import yaml

# 질병 이름 찾아오기 
def get_disease_key(disease_name):
  diseasecode = None
  
  # YAML 파일 로드
  with open('actions\\Disease_info.yml', 'r', encoding='utf-8') as file:
    yaml_data = yaml.safe_load(file)
  
  for key, v in yaml_data.items():
      if 'disease_identify' in v and disease_name in v['disease_identify']:
          diseasecode = key
          return diseasecode

  return diseasecode

## 질병 의도 keyword 가져오기 
word_lists = [
              # -1 발병 원인 
              ["이유", "원인", "왜", "발생", "발병" ],
              # -2 치료방법
              ["치료"], 
              # -3 질병 예방 
              ["예방" ],
              # -4 질병 주의 사항 
              ["주의",  ],
              # -5 질병 악화 
              ["악화", ], 
              # -6 알레르기 
              ["알레르기반응", "알레르기" ],
              # -7 전염
              ["전염", "옮길수", "옮기", ],
              # -8 홈케어 
              ["자연","자연요법","홈케어",], 
              # -9 재발 방지, 관리 
              ["재발", "방지", "관리"],
              
              ]  # 체크할 단어들의 리스트들

disease_KeywordList=[
                     ["cause"],["treatment"],["prevention"],
                     ["caution"],["worse"],["allergy"],
                     ["infection"],["homeCare"],["management"],
                     ]



def get_diseaseKeyword(UserMessage):
  disease_intent_keyword=None
  # 단어 체크
  for index, word_list in enumerate(word_lists):
      for word in word_list:
          if word in UserMessage:
            disease_intent_keyword=disease_KeywordList[index]
            
  if disease_intent_keyword is None:
    return None
  
  else:
    keyword = disease_intent_keyword[0]
    return keyword

# print(get_diseaseKeyword(text))

    

