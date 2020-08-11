/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

/*
The core registry
*/
export class Registry {
  private interestPool: InterestPool = new InterestPool();
  private objectPool: ObjectPool = new ObjectPool();

  /*
  Registers a new Interest
  notifies the holder of this Interest of matching objects
  returns the Interest handle
  */
  registerInterest = (objectHandle: string, callback: Function, objectTypes: string, tags: string): string => {
    // create new Interest
    this.log('registerInterest(' + objectHandle + ", '" + typeof callback + ", '" + objectTypes + "', '" + tags + "'");
    var newInterest = new Interest(objectHandle, callback, objectTypes, tags);
    var interestHandle = this.interestPool.addInterest(newInterest);

    // search for matching objects and call the new Interest back
    var matchingObjects = this.objectPool.getMatchingObjects(objectTypes, tags);
    if (matchingObjects.length > 0) {
      this.log('(registerInterest) - ' + newInterest + '.callback ' + matchingObjects);
      newInterest.callback(CallbackMsg.NEW_MATCH, matchingObjects);
    }
    return interestHandle;
  };

  /*
  Unregisters an Interest
  */
  unRegisterInterest = (interestHandle: string): void => {
    this.log('unRegisterInterest(' + interestHandle + ')');
    this.interestPool.deleteInterest(interestHandle);
  };

  /*
  Registers a new Object
  notifies all holders of Interests that match
  returns the Object handle
  */
  registerObject = (objectReference: object, objectTypes: string, tags: string): string => {
    // create new registered Object
    this.log('registerObject(' + objectReference + ", '" + objectTypes + "', '" + tags + "'");
    var newObject = new RegisteredObject(objectReference, objectTypes, tags);
    var objectHandle = this.objectPool.addObject(newObject);

    // create an Array to match the expected payload fomat for the callback
    var payload: object[] = [newObject];

    // search for matching Interests and call them back
    this.interestPool.getMatchingInterests(objectTypes, tags).forEach((matchingInterest) => {
      this.log('(registerObject) - ' + matchingInterest + '.callback ' + payload);
      matchingInterest.callback(CallbackMsg.NEW_MATCH, payload);
    });
    return objectHandle;
  };

  /*
  Unregisters an Object identified by its handle
  deletes all Interests held by this Object
  notifies all holder objects of Interests that match
  */
  unRegisterObject = (objectHandle: string): void => {
    this.log('unRegisterObject(' + objectHandle + ')');
    var obj = this.objectPool.getObject(objectHandle);

    // inform all matching interest holders
    this.interestPool.getMatchingInterests(obj.objectTypes, obj.tags).forEach((matchingInterest) => {
      this.log('(unRegisterObject) - ' + matchingInterest + '.callback ' + objectHandle);
      matchingInterest.callback(CallbackMsg.MATCH_LOST, objectHandle);
    });

    // unregister all Interests registered by this Object
    this.interestPool.getHeldInterests(objectHandle).forEach((heldInterest) => {
      this.unRegisterInterest(heldInterest.handle);
    });

    // last step: delete the object from the pool
    this.objectPool.deleteObject(objectHandle);
  };

  log = (msg: string) => {
    //console.log('[REGISTRY] ' + msg);
  };
}

/*
Manages all registered Interests
*/
export class InterestPool {
  private interests = new Map();
  private currentInterestHandle: number = 0;

  /*
  adds a new Interest to the pool
  */
  addInterest = (interest: Interest): string => {
    // generate handle for this Interest
    this.currentInterestHandle++;
    var handle = this.currentInterestHandle.toString();
    interest.handle = handle;

    // TODO: Avoid duplicate entries

    // add Interest to map
    this.interests.set(handle, interest);
    return handle;
  };

  /*
  deletes an Interest from the pool
  */
  deleteInterest = (handle: string): void => {
    // delete interest from map
    this.interests.delete(handle);
  };

  /*
  retrieves all Interests that match on passed parameters as an Array
  */
  getMatchingInterests = (objectTypes: string, tags: string): Interest[] => {
    var matchingInterests: Interest[] = [];

    // TO IMPROVE: find matches and add to array
    for (let value of this.interests.values()) {
      if (value.objectTypes == objectTypes) {
        matchingInterests.push(value);
      }
    }
    return matchingInterests;
  };

  /*
  retrieves all Interests that were registered by
  the object identified with the passed obectHandle
  */
  getHeldInterests = (objectHandle: string): Interest[] => {
    var heldInterests: Interest[] = [];

    // retrieve Interests held this object
    for (let value of this.interests.values()) {
      if (value.holdingObjectHandle == objectHandle) {
        heldInterests.push(value);
      }
    }
    return heldInterests;
  };
}

/*
Manages all registered Objects
*/
export class ObjectPool {
  private registeredObjects = new Map();
  private currentObjectHandle: number = 0;

  /*
  adds a new Object to the pool
  */
  addObject = (object: RegisteredObject): string => {
    // generate handle for this Interest
    this.currentObjectHandle++;
    var handle = this.currentObjectHandle.toString();
    object.handle = handle;

    // TODO: Avoid duplicate entries

    // add Interest to map
    this.registeredObjects.set(handle, object);
    return handle;
  };

  /*
  retrieves a certain Object from the pool
  */
  getObject = (handle: string): RegisteredObject => {
    return this.registeredObjects.get(handle);
  };

  /*
  deletes an Object from the pool
  */
  deleteObject = (handle: string): void => {
    // delete object from map
    this.registeredObjects.delete(handle);
  };

  /*
  retrieves all Objects that match on passed parameters as an Array
  */
  getMatchingObjects = (objectTypes: string, tags: string): RegisteredObject[] => {
    var matchingObjects: RegisteredObject[] = [];

    // TO IMPROVE: find matches and add to array
    for (let value of this.registeredObjects.values()) {
      if (value.objectTypes == objectTypes) {
        matchingObjects.push(value);
      }
    }
    return matchingObjects;
  };
}

export class Interest {
  handle: string;
  holdingObjectHandle: string;
  callback: Function;
  objectTypes: string;
  tags: string;

  constructor(holdingObjectHandle: string, callback: Function, objectTypes: string, tags: string) {
    this.handle = '';
    this.holdingObjectHandle = holdingObjectHandle;
    this.callback = callback;
    this.objectTypes = objectTypes;
    this.tags = tags;
  }
}

export class RegisteredObject {
  handle: string;
  objectReference: object;
  objectTypes: string;
  tags: string;

  constructor(objectReference: object, objectTypes: string, tags: string) {
    this.handle = '';
    this.objectReference = objectReference;
    this.objectTypes = objectTypes;
    this.tags = tags;
  }
}

export enum CallbackMsg {
  NEW_MATCH = 'NEW_MATCH',
  MATCH_LOST = 'MATCH_LOST',
}

export const registry: Registry = new Registry();
Object.seal(registry);
