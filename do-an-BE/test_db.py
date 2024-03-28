import pymongo
import bson
from bson import ObjectId, json_util


class API(object):
    def __init__(self):
        self.client = pymongo.MongoClient(
            "mongodb+srv://tuan2801:28Linkinstark@cluster0.phqii.mongodb.net/?retryWrites=true&w=majority")
        self.db = self.client["DoAnTotNghiep"]
        self.collectionUser = self.db["User"]
        self.collectionLevel = self.db["Level"]
        self.collectionResult = self.db["Result"]

    def findUser(self, username):
        user_data = self.collectionUser.find_one({"username": username})
        return user_data

    def findUserById(self, id):
        user_data = self.collectionUser.find_one({"_id": ObjectId(id)})
        return user_data

    def apiRegister(self, username, password, isAdmin=False):
        try:
            found_user = self.findUser(username)
            if (found_user):
                raise Exception("Username existed")
            new_user = {
                "username": username,
                "password": password,
                "isAdmin": isAdmin
            }
            self.collectionUser.insert_one(new_user)
            return {"success": 1, "message": "Đăng ký thành công"}
        except Exception as err:
            return {"success": 0, "message": str(err)}

    def apiLogin(self, username, password):
        try:
            found_user = self.findUser(username)
            if (not found_user):
                raise Exception("Wrong username or password")
            if (password != found_user['password']):
                raise Exception("Wrong username of password")
            found_user["_id"] = str(found_user["_id"])
            return {"success": 1, "data": found_user}
        except Exception as err:
            return {"success": 0, "message": str(err)}

    def apiGetLevels(self):
        levels = list(self.collectionLevel.find({}))
        for level in levels:
            level["_id"] = str(level["_id"])
        return {"success": 1, "data": levels}

    def apiCreateResult(self, user_id, level_id):
        new_result = {
            "user_id": user_id,
            "level_id": level_id,
            "score": 0,
            "percent": 0,
        }
        self.collectionResult.insert_one(new_result)

    def apiUpdateResult(self, user_id, level_id, score, percent):
        try:
            found_result = self.collectionResult.find_one({
                "user_id": user_id,
                "level_id": level_id,
            })

            if not found_result:
                self.apiCreateResult(user_id, level_id)
            self.collectionResult.find_one_and_update({
                "user_id": user_id,
                "level_id": level_id
            }, {
                '$set': {
                    "score": score,
                    "percent": percent
                }
            })
            return {"success": 1}
        except Exception as e:
            return {"success": 0, "message": str(e)}

    def apiGetAllResults(self, user_id):
        results = list(self.collectionResult.find({"user_id": user_id}))
        for result in results:
            result["_id"] = str(result["_id"])
            result["user_id"] = str(result["user_id"])
            result["level_id"] = str(result["level_id"])
        return {"success": 1, "data": results}
