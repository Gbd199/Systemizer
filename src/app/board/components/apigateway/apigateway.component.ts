import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PlacingService } from 'src/app/placing.service';
import { SelectionService } from 'src/app/selection.service';
import { Endpoint, EndpointAction } from 'src/models/Endpoint';
import { OperatorComponent } from '../Shared/OperatorComponent';
import { EndpointActionHTTPMethod, HTTPMethod } from 'src/models/enums/HTTPMethod';
import { Protocol } from 'src/models/enums/Protocol';
import { APIGateway } from 'src/models/APIGateway';

@Component({
	selector: 'apigateway',
	queries: {
		anchorRef: new ViewChild( "anchorRef" ),
		optionsRef: new ViewChild( "options" ),
		inputPortRef: new ViewChild("inputPort"),
		outputPortRef: new ViewChild("outputPort")
	},
	templateUrl: './apigateway.component.html',
	styleUrls: ['./apigateway.component.scss']
})
export class ApiGatewayComponent  extends OperatorComponent implements OnInit{

	public LogicApiGateway : APIGateway = new APIGateway();
	
	@ViewChild("conn", { read: ViewContainerRef }) conn;

	connectableEndpoints: Endpoint[];

	constructor(placingService: PlacingService, selectionService: SelectionService, resolver: ComponentFactoryResolver){
		super(placingService, selectionService, resolver);
	}

	addAction(endpoint: Endpoint){
		endpoint.actions.push(new EndpointAction());
	}

	removeAction(endpoint: Endpoint, action: EndpointAction){
		let idx = 0;
		for(let act of endpoint.actions){
			if(act === action) 
				endpoint.actions.splice(idx,1);
			idx++;
		}
	}

	addRestEndpoint(){
		this.LogicApiGateway.options.restEndpoints.push(new Endpoint("api/posts", [HTTPMethod.GET, HTTPMethod.POST, HTTPMethod.PUT, HTTPMethod.DELETE, ]));
	}
	addRpcEndpoint(){
		this.LogicApiGateway.options.rpcEndpoints.push(new Endpoint("api/getPosts", [HTTPMethod.GET]));
	}
	addGrpcEndpoint(){
		this.LogicApiGateway.options.grpcEndpoints.push(new Endpoint("api/getPosts", [HTTPMethod.GET]));
	}
	addGraphqlEndpoint(){
		this.LogicApiGateway.options.graphqlEndpoints.push(new Endpoint("/graphql", [HTTPMethod.GET, HTTPMethod.POST]));
	}
	addWebsocketsEndpoint(){
		let wsEp = new Endpoint("api/sendMessage", [HTTPMethod.GET]);
		wsEp.protocol = Protocol.WebSockets;
		this.LogicApiGateway.options.websocketsEndpoints.push(wsEp);
	}

	removeRestEndpoint(endpoint: Endpoint){
		let idx = 0;
		for(let ep of this.LogicApiGateway.options.restEndpoints){
			if(ep === endpoint) 
			 	this.LogicApiGateway.options.restEndpoints.splice(idx,1);
			idx++;
		}	
	}
	removeRpcEndpoint(endpoint: Endpoint){
		let idx = 0;
		for(let ep of this.LogicApiGateway.options.rpcEndpoints){
			if(ep === endpoint) 
				this.LogicApiGateway.options.rpcEndpoints.splice(idx,1);
			idx++;
		}	
	}
	removeGrpcEndpoint(endpoint: Endpoint){
		let idx = 0;
		for(let ep of this.LogicApiGateway.options.grpcEndpoints){
			if(ep === endpoint) 
				this.LogicApiGateway.options.grpcEndpoints.splice(idx,1);
			idx++;
		}	
	}
	removeGraphqlEndpoint(endpoint: Endpoint){
		this.LogicApiGateway.options.graphqlEndpoints = [];
	}
	removeWebsocketsEndpoint(endpoint: Endpoint){
		let idx = 0;
		for(let ep of this.LogicApiGateway.options.websocketsEndpoints){
			if(ep === endpoint) 
				this.LogicApiGateway.options.websocketsEndpoints.splice(idx,1);
			idx++;
		}	
	}

	handleActionEndpointChange(endpoint: Endpoint, action: EndpointAction){
		action.method = endpoint.protocol != Protocol.WebSockets && action.endpoint.protocol != Protocol.WebSockets ? EndpointActionHTTPMethod.Inherit : EndpointActionHTTPMethod[HTTPMethod[action.endpoint.supportedMethods[0]]];
	}

	handleEndpointMethodChange(endpoint: Endpoint){
		if(endpoint.supportedMethods.length == 0)
			endpoint.supportedMethods = [HTTPMethod.GET];
	}

	handleEndpointUrlChange(endpoint){
		if(endpoint.url == null || endpoint.url.replace(/\s/g,"") == "")
			endpoint.url = `api/v${Math.floor(10*Math.random())}`;
	}

	public handleClick(){
		super.handleClick();
		this.connectableEndpoints = this.LogicApiGateway.getConnectableEndpoints();
		for(let j = 0; j < this.LogicApiGateway.options.endpoints.length; j++){
			let endpoint = this.LogicApiGateway.options.endpoints[j]
			for(let i = 0; i < endpoint.actions.length; i++){
				let action = endpoint.actions[i];
				let currEdp = action.endpoint;
				let currMth = action.method;
				this.LogicApiGateway.options.endpoints[j].actions[i].endpoint = null;
				if(this.connectableEndpoints.length == 0){
					this.connectableEndpoints = [];
					endpoint.actions = [];
					return;
				}
				if(currEdp != null && currMth != null){
					for(let e of this.connectableEndpoints){ // need this workaround to keep values in material select....
						if(e.url == currEdp.url)
							this.LogicApiGateway.options.endpoints[j].actions[i].endpoint = e;
					}
					endpoint.actions[i].method = currMth;
				}
				else
					endpoint.actions.splice(i,1);
			}
		}
	}

	ngAfterViewInit(): void {
		super.Init(this.conn);
  	}

	public getLogicComponent(){
		return this.LogicApiGateway;
	}

	getActionsElement(){
		return null;
	}

	ngOnInit(){}
}