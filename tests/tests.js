describe('summary', function(){
	describe('parse', function(){
		it('should parse statistics correctly', function(callback){
			$.ajax({
	            url: "xml/api.xml",
	            type: "GET",
	            dataType: "text",

	            success: function(data){
	            	var objStatistics = parseStatistics(data);
	            	chai.assert.equal(objStatistics.product_info.name, "oVirt Engine");
	            	chai.assert.equal(objStatistics.product_info.vendor, "ovirt.org");
	            	chai.assert.equal(objStatistics.product_info.full_version, "3.5.0.1-1.el6");
	            	chai.assert.equal(objStatistics.summary.vms.total, "1");
	            	chai.assert.equal(objStatistics.summary.vms.active, "0");
	            	chai.assert.equal(objStatistics.time, "2015-01-22T15:13:55.227-05:00");
	                callback();
	            },

	            error: function(err){
	                callback(err);
	            }
	        });
		})
	});
});

describe('datacenters', function(){
	describe('parse', function(){
		it('should parse datacenters correctly', function(callback){
			$.ajax({
	            url: "xml/datacenters.xml",
	            type: "GET",
	            dataType: "text",

	            success: function(data){
	            	var objDatacenters = parseDatacenters(data);
	            	chai.assert.equal(objDatacenters[0].name, "Default");
	            	chai.assert.equal(objDatacenters[0].id, "00000002-0002-0002-0002-0000000001bb");
	            	chai.assert.equal(objDatacenters[0].status, "uninitialized");
	            	chai.assert.equal(objDatacenters[0].compatibilityMajor, "3");
	            	chai.assert.equal(objDatacenters[0].compatibilityMinor, "5");

	            	chai.assert.equal(objDatacenters[1].name, "local_datacenter");
	            	chai.assert.equal(objDatacenters[1].id, "3f6fa753-f7b6-4576-bdb0-7185f825c9e2");
	            	chai.assert.equal(objDatacenters[1].status, "up");
	            	chai.assert.equal(objDatacenters[1].compatibilityMajor, "3");
	            	chai.assert.equal(objDatacenters[1].compatibilityMinor, "5");

	            	chai.assert.equal(objDatacenters.length, 2);	            	
	                callback();
	            },

	            error: function(err){
	                callback(err);
	            }
	        });
		})
	});
});

describe('storage', function(){
	describe('parse', function(){
		it('should parse storage correctly', function(callback){
			$.ajax({
	            url: "xml/storagedomains.xml",
	            type: "GET",
	            dataType: "text",

	            success: function(data){
	            	var objStorages = praseStorage(data);
	            	chai.assert.equal(objStorages[0].name, "ISO_DOMAIN");
	            	chai.assert.equal(objStorages[0].id, "05fea09c-8bc3-4252-85da-3c88c97cf55c");
	            	chai.assert.equal(objStorages[0].type, "iso");
	            	chai.assert.equal(objStorages[0].storageType, "nfs");
	            	chai.assert.equal(objStorages[0].storageFormat, "v1");

	            	chai.assert.equal(objStorages[1].name, "local_storage");
	            	chai.assert.equal(objStorages[1].id, "904ff8bd-7c47-4d55-bdd2-e6b74659c453");
	            	chai.assert.equal(objStorages[1].type, "data");
	            	chai.assert.equal(objStorages[1].storageType, "localfs");
	            	chai.assert.equal(objStorages[1].storageFormat, "v3");

	            	chai.assert.equal(objStorages[2].name, "ovirt-image-repository");
	            	chai.assert.equal(objStorages[2].id, "072fbaa1-08f3-4a40-9f34-a5ca22dd1d74");
	            	chai.assert.equal(objStorages[2].type, "image");
	            	chai.assert.equal(objStorages[2].storageType, "glance");
	            	chai.assert.equal(objStorages[2].storageFormat, "v1");

	            	chai.assert.equal(objStorages.length, 3);

	                callback();
	            },

	            error: function(err){
	                callback(err);
	            }
	        });
		})
	});
});

describe('networks', function(){
	describe('parse', function(){
		it('should parse networks correctly', function(callback){
			$.ajax({
	            url: "xml/networks.xml",
	            type: "GET",
	            dataType: "text",

	            success: function(data){
	            	var objNetworks = parseNetworks(data);
	            	chai.assert.equal(objNetworks[0].name, "ovirtmgmt");
	            	chai.assert.equal(objNetworks[0].description, "Management Network");
	            	chai.assert.equal(objNetworks[0].id, "00000000-0000-0000-0000-000000000009");
	            	chai.assert.equal(objNetworks[0].datacenter, "00000002-0002-0002-0002-0000000001bb");
	            	chai.assert.equal(objNetworks[0].usage, "vm");

	            	chai.assert.equal(objNetworks[1].name, "ovirtmgmt");
	            	chai.assert.equal(objNetworks[1].description, "Management Network");
	            	chai.assert.equal(objNetworks[1].id, "683d5a55-3849-4260-850a-c4fd8d12e5ca");
	            	chai.assert.equal(objNetworks[1].datacenter, "3f6fa753-f7b6-4576-bdb0-7185f825c9e2");
	            	chai.assert.equal(objNetworks[1].usage, "vm");

	            	chai.assert.equal(objNetworks.length, 2);
	                callback();
	            },

	            error: function(err){
	                callback(err);
	            }
	        });
		})
	});
});

describe('clusters', function(){
	describe('parse', function(){
		it('should parse clusters correctly', function(callback){
			$.ajax({
	            url: "xml/clusters.xml",
	            type: "GET",
	            dataType: "text",

	            success: function(data){
	            	var objClusters = parseClusters(data);
	            	chai.assert.equal(objClusters[0].name, "Default");
	            	chai.assert.equal(objClusters[0].id, "00000001-0001-0001-0001-000000000338");
	            	chai.assert.equal(objClusters[0].datacenter, "00000002-0002-0002-0002-0000000001bb");
	            	chai.assert.equal(objClusters[0].compatibilityMajor, "3");
	            	chai.assert.equal(objClusters[0].compatibilityMinor, "5");

	            	chai.assert.equal(objClusters[1].name, "local_cluster");
	            	chai.assert.equal(objClusters[1].id, "c597aa55-8c1d-45f3-a07d-395063231da6");
	            	chai.assert.equal(objClusters[1].datacenter, "3f6fa753-f7b6-4576-bdb0-7185f825c9e2");
	            	chai.assert.equal(objClusters[1].compatibilityMajor, "3");
	            	chai.assert.equal(objClusters[1].compatibilityMinor, "5");	            	
	            	
	            	chai.assert.equal(objClusters.length, 2);
	                callback();
	            },

	            error: function(err){
	                callback(err);
	            }
	        });
		})
	});
});